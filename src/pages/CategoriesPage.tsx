import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { 
  Tags, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  FolderTree,
  X,
  Save
} from 'lucide-react'
import { dbService, supabase } from '../lib/supabase'
import { formatDateTime } from '../utils/format'
import type { Category } from '../lib/supabase'

interface CategoryFormData {
  name: string
  description: string
  parent_category_id: string | null
}

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    parent_category_id: null
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const data = await dbService.getCategories()
      setCategories(data)
    } catch (error) {
      console.error('Failed to load categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getParentCategories = () => {
    return categories.filter(cat => !cat.parent_category_id)
  }

  const getSubCategories = (parentId: string) => {
    return categories.filter(cat => cat.parent_category_id === parentId)
  }

  const getCategoryHierarchy = () => {
    const parentCategories = getParentCategories()
    return parentCategories.map(parent => ({
      ...parent,
      subcategories: getSubCategories(parent.id)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingCategory) {
        // Update existing category
        await supabase
          .from('categories')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCategory.id)
      } else {
        // Create new category
        await supabase
          .from('categories')
          .insert({
            ...formData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
      }
      
      await loadCategories()
      resetForm()
    } catch (error) {
      console.error('Failed to save category:', error)
      alert('Failed to save category. Please try again.')
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description,
      parent_category_id: category.parent_category_id
    })
    setShowAddModal(true)
  }

  const handleDelete = async (categoryId: string) => {
    // Check if category has subcategories
    const hasSubcategories = categories.some(cat => cat.parent_category_id === categoryId)
    if (hasSubcategories) {
      alert('Cannot delete category with subcategories. Please delete subcategories first.')
      return
    }

    if (!confirm('Are you sure you want to delete this category? This will affect all associated products.')) return
    
    try {
      await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId)
      
      await loadCategories()
    } catch (error) {
      console.error('Failed to delete category:', error)
      alert('Failed to delete category. Please try again.')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      parent_category_id: null
    })
    setEditingCategory(null)
    setShowAddModal(false)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Tags className="h-8 w-8 text-quickcart-600 mr-3" />
            Category Management
          </h1>
          <p className="text-gray-600 mt-1">Organize products with categories and subcategories</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-gray-600">
              {filteredCategories.length} categories found
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Hierarchy */}
      <div className="space-y-4">
        {getCategoryHierarchy()
          .filter(parent => 
            parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            parent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            parent.subcategories.some(sub => 
              sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              sub.description.toLowerCase().includes(searchTerm.toLowerCase())
            )
          )
          .map(parent => (
            <Card key={parent.id}>
              <CardContent className="p-6">
                {/* Parent Category */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-quickcart-100 rounded-lg">
                      <FolderTree className="h-6 w-6 text-quickcart-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{parent.name}</h3>
                      <p className="text-sm text-gray-600">{parent.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(parent)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(parent.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Subcategories */}
                {parent.subcategories.length > 0 && (
                  <div className="ml-8 space-y-3 border-l-2 border-gray-200 pl-4">
                    {parent.subcategories
                      .filter(sub => 
                        sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        sub.description.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map(subcategory => (
                        <div key={subcategory.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Tags className="h-4 w-4 text-gray-400" />
                            <div>
                              <h4 className="font-medium text-gray-900">{subcategory.name}</h4>
                              <p className="text-sm text-gray-600">{subcategory.description}</p>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(subcategory)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(subcategory.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
                
                <div className="text-xs text-gray-500 mt-4 pt-3 border-t">
                  Created: {formatDateTime(parent.created_at)}
                  {parent.subcategories.length > 0 && (
                    <span className="ml-4">{parent.subcategories.length} subcategories</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

        {/* Standalone categories (no parent) that don't have subcategories */}
        {categories
          .filter(cat => !cat.parent_category_id && getSubCategories(cat.id).length === 0)
          .filter(cat => 
            cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cat.description.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map(category => (
            <Card key={category.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-quickcart-100 rounded-lg">
                      <Tags className="h-6 w-6 text-quickcart-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 mt-4 pt-3 border-t">
                  Created: {formatDateTime(category.created_at)}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {filteredCategories.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Tags className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Categories Found</h3>
            <p className="text-gray-600">
              {searchTerm
                ? 'No categories match your search criteria.'
                : 'Get started by creating your first category.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={resetForm} />
            
            <Card className="relative w-full max-w-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{editingCategory ? 'Edit Category' : 'Add New Category'}</span>
                  <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                    <X className="h-6 w-6" />
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Category Name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                    <select
                      value={formData.parent_category_id || ''}
                      onChange={(e) => setFormData({...formData, parent_category_id: e.target.value || null})}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-quickcart-500"
                    >
                      <option value="">None (Top Level Category)</option>
                      {getParentCategories()
                        .filter(cat => !editingCategory || cat.id !== editingCategory.id)
                        .map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-quickcart-500"
                      rows={3}
                      placeholder="Category description..."
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      <Save className="h-4 w-4 mr-1" />
                      {editingCategory ? 'Update Category' : 'Create Category'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}