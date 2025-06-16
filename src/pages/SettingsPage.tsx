import React, { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs'
import { UserPreferences } from '../components/admin/UserPreferences'
import { SystemSettings } from '../components/admin/SystemSettings'
import { Settings, User, Server } from 'lucide-react'

export const SettingsPage: React.FC = () => {
  return (
    <div className="p-6">
      <Tabs defaultValue="user" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Settings className="h-8 w-8 text-quickcart-600 mr-3" />
              Settings
            </h1>
            <p className="text-gray-600 mt-1">Manage your preferences and system configuration</p>
          </div>
          
          <TabsList>
            <TabsTrigger value="user" className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              User Preferences
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center">
              <Server className="h-4 w-4 mr-2" />
              System Settings
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="user">
          <UserPreferences />
        </TabsContent>

        <TabsContent value="system">
          <SystemSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}