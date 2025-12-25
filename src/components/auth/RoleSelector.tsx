import { GraduationCap, User, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

type Role = 'student' | 'faculty' | 'librarian';

interface RoleSelectorProps {
  selectedRole: Role;
  onRoleChange: (role: Role) => void;
}

const roles = [
  { id: 'student' as Role, label: 'Student', icon: GraduationCap },
  { id: 'faculty' as Role, label: 'Faculty', icon: User },
  { id: 'librarian' as Role, label: 'Librarian', icon: Users },
];

export function RoleSelector({ selectedRole, onRoleChange }: RoleSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {roles.map((role) => {
        const Icon = role.icon;
        const isSelected = selectedRole === role.id;

        return (
          <button
            key={role.id}
            type="button"
            onClick={() => onRoleChange(role.id)}
            className={cn(
              "role-tab",
              isSelected && "role-tab-active"
            )}
          >
            <Icon className={cn(
              "h-6 w-6 mb-1",
              isSelected ? "text-primary" : "text-muted-foreground"
            )} />
            <span className={cn(
              "text-sm font-medium",
              isSelected ? "text-primary" : "text-muted-foreground"
            )}>
              {role.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
