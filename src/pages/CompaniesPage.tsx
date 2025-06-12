import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { 
  Building2, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Globe,
  Mail,
  Phone,
  MapPin,
  X,
  Save
} from 'lucide-react'
import { dbService, supabase } from '../lib/supabase'
import { formatDateTime } from '../utils/format'
import type { Company } from '../lib/supabase'

interface CompanyFormData {
  name: string
  country: string
  contact_info: {
    email?: string
    phone?: string
    website?: string
    address?: string
  }
}

export const CompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    country: '',
    contact_info: {}
  })

  useEffect(() => {
    loadCompanies()
  }, [])

  const loadCompanies = async () => {
    try {
      const data = await dbService.getCompanies()
      setCompanies(data)
    } catch (error) {
      console.error('Failed to load companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.country.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingCompany) {
        // Update existing company
        await supabase
          .from('companies')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCompany.id)
      } else {
        // Create new company
        await supabase
          .from('companies')
          .insert({
            ...formData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
      }
      
      await loadCompanies()
      resetForm()
    } catch (error) {
      console.error('Failed to save company:', error)
      alert('Failed to save company. Please try again.')
    }
  }

  const handleEdit = (company: Company) => {
    setEditingCompany(company)
    setFormData({
      name: company.name,
      country: company.country,
      contact_info: company.contact_info || {}
    })
    setShowAddModal(true)
  }

  const handleDelete = async (companyId: string) => {
    if (!confirm('Are you sure you want to delete this company? This will affect all associated products.')) return
    
    try {
      await supabase
        .from('companies')
        .delete()
        .eq('id', companyId)
      
      await loadCompanies()
    } catch (error) {
      console.error('Failed to delete company:', error)
      alert('Failed to delete company. Please try again.')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      country: '',
      contact_info: {}
    })
    setEditingCompany(null)
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
            <Building2 className="h-8 w-8 text-quickcart-600 mr-3" />
            Company Management
          </h1>
          <p className="text-gray-600 mt-1">Manage supplier companies and brands</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Company
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-gray-600">
              {filteredCompanies.length} companies found
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map(company => (
          <Card key={company.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-quickcart-100 rounded-lg">
                    <Building2 className="h-6 w-6 text-quickcart-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{company.name}</h3>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {company.country}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(company)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(company.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {company.contact_info && Object.keys(company.contact_info).length > 0 && (
                <div className="space-y-2 mb-4">
                  {company.contact_info.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      {company.contact_info.email}
                    </div>
                  )}
                  {company.contact_info.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {company.contact_info.phone}
                    </div>
                  )}
                  {company.contact_info.website && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Globe className="h-4 w-4 mr-2" />
                      <a 
                        href={company.contact_info.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-quickcart-600 hover:underline"
                      >
                        Website
                      </a>
                    </div>
                  )}
                </div>
              )}
              
              <div className="text-xs text-gray-500 border-t pt-3">
                Created: {formatDateTime(company.created_at)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Companies Found</h3>
            <p className="text-gray-600">
              {searchTerm
                ? 'No companies match your search criteria.'
                : 'Get started by adding your first company.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Company Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={resetForm} />
            
            <Card className="relative w-full max-w-2xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{editingCompany ? 'Edit Company' : 'Add New Company'}</span>
                  <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                    <X className="h-6 w-6" />
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Company Name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                    <Input
                      label="Country"
                      value={formData.country}
                      onChange={(e) => setFormData({...formData, country: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Contact Information</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Email"
                        type="email"
                        value={formData.contact_info.email || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          contact_info: { ...formData.contact_info, email: e.target.value }
                        })}
                      />
                      <Input
                        label="Phone"
                        value={formData.contact_info.phone || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          contact_info: { ...formData.contact_info, phone: e.target.value }
                        })}
                      />
                    </div>
                    
                    <Input
                      label="Website"
                      value={formData.contact_info.website || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        contact_info: { ...formData.contact_info, website: e.target.value }
                      })}
                      placeholder="https://example.com"
                    />
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <textarea
                        value={formData.contact_info.address || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          contact_info: { ...formData.contact_info, address: e.target.value }
                        })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-quickcart-500"
                        rows={3}
                        placeholder="Company address..."
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      <Save className="h-4 w-4 mr-1" />
                      {editingCompany ? 'Update Company' : 'Create Company'}
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