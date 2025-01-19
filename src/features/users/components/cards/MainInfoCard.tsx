import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Role } from '@/features/users/types/types';
import { Mail, Music } from 'lucide-react';

interface MainInfoCardProps {
  user: User;
  role: Role;
}

export function MainInfoCard({ user }: MainInfoCardProps) {
  console.log('User data:', user);

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage alt={user.username} />
          <AvatarFallback>
            {user.first_name?.[0]}
            {user.last_name?.[0]}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <CardTitle className="text-2xl">
            {user.first_name} {user.last_name}
          </CardTitle>
          <p className="text-sm text-gray-500">@{user.username}</p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Mail className="h-4 w-4" />
            {user.email}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {user.role && (
            <Badge variant="secondary">
              {user.role.name || 'User'}
            </Badge>
          )}
          {user.has_instrument && (
            <Badge variant="default">
              <Music className="mr-1 h-3 w-3" />
              Has Instrument
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}