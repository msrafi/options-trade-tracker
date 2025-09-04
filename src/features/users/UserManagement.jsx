import React, { useState } from 'react'
import { AppButton, AppInput, AppSelect } from '../../design-system'

export default function UserManagement({ 
  users, 
  currentUser, 
  onAddUser, 
  onUpdateUser, 
  onDeleteUser, 
  onSwitchUser 
}) {
  const [newUser, setNewUser] = useState("")
  const [editingUser, setEditingUser] = useState(null)
  const [editName, setEditName] = useState("")

  const handleAddUser = (e) => {
    e.preventDefault()
    if (newUser.trim()) {
      onAddUser(newUser.trim())
      setNewUser("")
    }
  }

  const handleUpdateUser = (e) => {
    e.preventDefault()
    if (editName.trim() && editingUser) {
      onUpdateUser(editingUser, editName.trim())
      setEditingUser(null)
      setEditName("")
    }
  }

  const startEdit = (username) => {
    setEditingUser(username)
    setEditName(username)
  }

  const cancelEdit = () => {
    setEditingUser(null)
    setEditName("")
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex gap-2 items-center">
          <AppSelect
            value={currentUser}
            onChange={(e) => onSwitchUser(e.target.value)}
            options={users.map(u => ({ value: u, label: u }))}
            className="w-full"
          />
        </div>

        {/* Add new user form */}
        <form onSubmit={handleAddUser} className="flex gap-2 items-center">
          <AppInput
            placeholder="Add new user..."
            value={newUser}
            onChange={(e) => setNewUser(e.target.value)}
            className="flex-1"
          />
          <AppButton type="submit" size="sm">Add</AppButton>
        </form>

        {/* User list with edit/delete options */}
        <div className="space-y-2 max-h-[200px] overflow-y-auto border border-zinc-200 dark:border-zinc-700 rounded-lg p-2">
          {users.map(user => (
            <div key={user} className="flex items-center gap-2 py-2 px-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded">
              {editingUser === user ? (
                <form onSubmit={handleUpdateUser} className="flex gap-2 items-center flex-1">
                  <AppInput
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1"
                    autoFocus
                  />
                  <AppButton type="submit" size="sm" variant="success">Save</AppButton>
                  <AppButton type="button" size="sm" variant="ghost" onClick={cancelEdit}>Cancel</AppButton>
                </form>
              ) : (
                <>
                  <span className="flex-1 font-medium">{user}</span>
                  <AppButton 
                    size="sm" 
                    variant="secondary" 
                    onClick={() => startEdit(user)}
                    disabled={user === 'default'}
                  >
                    Edit
                  </AppButton>
                  <AppButton 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => onDeleteUser(user)}
                    disabled={user === 'default' || user === currentUser}
                  >
                    Delete
                  </AppButton>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
