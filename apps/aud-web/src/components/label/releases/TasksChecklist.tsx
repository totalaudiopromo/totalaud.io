'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { TrashIcon } from '@heroicons/react/20/solid'
import { useLabelStore } from '@/stores/useLabelStore'
import { fieldInputClass, secondaryButtonClass } from '../ui/LabelModal'

export function TasksChecklist({ labelId, releaseId }: { labelId: string; releaseId: string }) {
  const allTasks = useLabelStore((s) => s.tasks)
  const createTask = useLabelStore((s) => s.createTask)
  const toggleTask = useLabelStore((s) => s.toggleTask)
  const deleteTask = useLabelStore((s) => s.deleteTask)

  const tasks = useMemo(
    () => allTasks.filter((t) => t.release_id === releaseId),
    [allTasks, releaseId]
  )
  const today = new Date().toISOString().slice(0, 10)

  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    if (!title.trim() || saving) return
    setSaving(true)
    try {
      await createTask({
        label_id: labelId,
        release_id: releaseId,
        title: title.trim(),
        due_date: dueDate || null,
      })
      setTitle('')
      setDueDate('')
    } finally {
      setSaving(false)
    }
  }

  const done = tasks.filter((t) => t.completed).length

  return (
    <section className="rounded-ta border border-ta-border bg-ta-panel">
      <div className="flex items-center justify-between px-5 py-3 border-b border-ta-border">
        <h2 className="text-sm font-semibold text-ta-white">Release tasks</h2>
        {tasks.length > 0 && (
          <span className="text-xs text-ta-muted">
            {done}/{tasks.length} done
          </span>
        )}
      </div>

      {tasks.length === 0 ? (
        <p className="px-5 py-4 text-sm text-ta-grey">
          No tasks yet. Artwork, distribution, promo — capture what needs doing.
        </p>
      ) : (
        <ul>
          {tasks.map((task) => {
            const overdue = !task.completed && task.due_date && task.due_date < today
            return (
              <li
                key={task.id}
                className="flex items-center gap-3 px-5 py-2.5 border-b border-ta-border last:border-b-0 group"
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={(e) => void toggleTask(task.id, e.target.checked)}
                  className="h-4 w-4 rounded accent-[#3AA9BE] cursor-pointer shrink-0"
                  aria-label={`Mark "${task.title}" ${task.completed ? 'incomplete' : 'complete'}`}
                />
                <p
                  className={`text-sm flex-1 min-w-0 truncate ${
                    task.completed ? 'text-ta-muted line-through' : 'text-ta-white'
                  }`}
                >
                  {task.title}
                </p>
                {task.due_date && (
                  <span
                    className={`text-[11px] shrink-0 ${overdue ? 'text-ta-error' : 'text-ta-grey'}`}
                  >
                    {new Date(`${task.due_date}T00:00:00`).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => void deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 text-ta-muted hover:text-ta-error transition-all duration-120"
                  aria-label={`Delete ${task.title}`}
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <form onSubmit={handleAdd} className="flex gap-2 px-5 py-3 border-t border-ta-border">
        <input
          className={`${fieldInputClass} flex-1`}
          placeholder="New task"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
        />
        <input
          type="date"
          className={`${fieldInputClass} w-40`}
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          aria-label="Due date"
        />
        <button type="submit" className={secondaryButtonClass} disabled={saving || !title.trim()}>
          Add
        </button>
      </form>
    </section>
  )
}
