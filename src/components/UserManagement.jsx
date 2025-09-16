import { useState } from 'react'
import { AppCard, AppButton, AppInput, AppSelect } from '../design-system'

export default function UserManagement({ 
  users, 
  currentUser, 
  onUserSwitch, 
  onAddUser, 
  onEditUser, 
  onDeleteUser,
  onClose 
}) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Day Trader',
    avatar: '👤'
  })

  const roles = [
    'Day Trader',
    'Swing Trader', 
    'Options Specialist',
    'Quantitative Analyst',
    'Hedge Fund Manager',
    'Retail Investor',
    'Professional Trader'
  ]

  const avatars = ['👤', '👨‍💼', '👩‍💻', '👨‍🎓', '👩‍🔬', '👨‍🚀', '👩‍💼', '👨‍💻', '👩‍🎓', '👨‍🔬', '👩‍🚀']

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (editingUser) {
      onEditUser(editingUser.id, formData)
      setEditingUser(null)
    } else {
      onAddUser(formData)
      setIsAdding(false)
    }
    
    setFormData({ name: '', email: '', role: 'Day Trader', avatar: '👤' })
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    })
    setIsAdding(false)
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingUser(null)
    setFormData({ name: '', email: '', role: 'Day Trader', avatar: '👤' })
  }

  const handleDelete = (user) => {
    if (confirm(`Are you sure you want to delete ${user.name}? This will also delete all their trading data.`)) {
      onDeleteUser(user.id)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <AppCard className="h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">User Management</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Manage users and their trading data</p>
            </div>
            <div className="flex items-center gap-2">
              <AppButton 
                variant="primary" 
                onClick={() => setIsAdding(true)}
                disabled={isAdding || editingUser}
              >
                Add User
              </AppButton>
              <AppButton variant="ghost" onClick={onClose}>
                Close
              </AppButton>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
              {/* User List */}
              <div className="space-y-4 overflow-y-auto">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Users ({users.length})</h3>
                <div className="space-y-2">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className={`p-4 rounded-lg border transition-all duration-200 ${
                        currentUser?.id === user.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                          : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{user.avatar}</div>
                          <div>
                            <h4 className="font-medium text-zinc-900 dark:text-zinc-100">{user.name}</h4>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">{user.role}</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-500">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {currentUser?.id !== user.id && (
                            <AppButton
                              variant="secondary"
                              size="sm"
                              onClick={() => onUserSwitch(user)}
                            >
                              Switch
                            </AppButton>
                          )}
                          <AppButton
                            variant="secondary"
                            size="sm"
                            onClick={() => handleEdit(user)}
                            disabled={isAdding || editingUser}
                          >
                            Edit
                          </AppButton>
                          <AppButton
                            variant="warning"
                            size="sm"
                            onClick={() => handleDelete(user)}
                            disabled={currentUser?.id === user.id || isAdding || editingUser}
                          >
                            Delete
                          </AppButton>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                        {user.totalTrades} trades • {user.totalPnL >= 0 ? '+' : ''}${user.totalPnL} P&L
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add/Edit Form */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  {editingUser ? 'Edit User' : isAdding ? 'Add New User' : 'User Details'}
                </h3>
                
                {(isAdding || editingUser) ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <AppInput
                      id="name"
                      label="Full Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                    
                    <AppInput
                      id="email"
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                    
                    <AppSelect
                      id="role"
                      label="Role"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      options={roles.map(role => ({ value: role, label: role }))}
                    />
                    
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        Avatar
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {avatars.map((avatar) => (
                          <button
                            key={avatar}
                            type="button"
                            onClick={() => setFormData({ ...formData, avatar })}
                            className={`w-10 h-10 text-xl rounded-lg border-2 transition-all duration-200 ${
                              formData.avatar === avatar
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                            }`}
                          >
                            {avatar}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-4">
                      <AppButton type="submit" variant="primary">
                        {editingUser ? 'Update User' : 'Add User'}
                      </AppButton>
                      <AppButton type="button" variant="secondary" onClick={handleCancel}>
                        Cancel
                      </AppButton>
                    </div>
                  </form>
                ) : (
                  <div className="text-center text-zinc-500 dark:text-zinc-400 py-8">
                    <div className="text-4xl mb-2">👥</div>
                    <p>Select a user to edit or add a new user</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </AppCard>
      </div>
    </div>
  )
}
