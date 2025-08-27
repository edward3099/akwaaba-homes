'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { User, Search, X } from 'lucide-react'

interface Agent {
  id: string
  email: string
  first_name: string
  last_name: string
  role: string
}

interface AgentSelectorProps {
  selectedAgentId?: string | null
  onAgentSelect: (agentId: string | null) => void
  placeholder?: string
  disabled?: boolean
}

export function AgentSelector({
  selectedAgentId,
  onAgentSelect,
  placeholder = "Select an agent...",
  disabled = false
}: AgentSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchAgents = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/agents')
      if (response.ok) {
        const data = await response.json()
        setAgents(data.agents || [])
      }
    } catch (error) {
      console.error('Error fetching agents:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchAgents()
    }
  }, [isOpen])

  const handleAgentSelect = (agent: Agent) => {
    onAgentSelect(agent.id)
    setIsOpen(false)
  }

  const handleRemoveAgent = () => {
    onAgentSelect(null)
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full justify-between"
      >
        <span>{placeholder}</span>
        <User className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border rounded-lg shadow-lg p-4">
          <Input
            placeholder="Search agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-3"
          />
          
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => handleAgentSelect(agent)}
                  className="w-full p-2 text-left border rounded hover:bg-gray-50"
                >
                  <div className="font-medium">{agent.first_name} {agent.last_name}</div>
                  <div className="text-sm text-gray-600">{agent.email}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
