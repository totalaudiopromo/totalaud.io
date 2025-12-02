import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { List, ListItem } from '../ui/List'

interface NextActionsListProps {
  actions: Array<{
    id: string
    action: string
    priority: 'high' | 'medium' | 'low'
    category: string
  }>
}

export function NextActionsList({ actions }: NextActionsListProps) {
  const priorityVariant = (priority: string) => {
    if (priority === 'high') return 'error'
    if (priority === 'medium') return 'warning'
    return 'default'
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold text-tap-white lowercase mb-4">next actions</h3>
      {actions.length === 0 ? (
        <p className="text-sm text-tap-grey lowercase">no actions available</p>
      ) : (
        <List variant="bordered">
          {actions.map((item) => (
            <ListItem key={item.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm text-tap-white lowercase mb-1">{item.action}</p>
                  <p className="text-xs text-tap-grey lowercase">{item.category}</p>
                </div>
                <Badge variant={priorityVariant(item.priority)} size="sm">
                  {item.priority}
                </Badge>
              </div>
            </ListItem>
          ))}
        </List>
      )}
    </Card>
  )
}
