import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Profile } from '@/features/users/types/types';
import { CalendarDays, MapPin, BookText } from 'lucide-react';

interface ProfileCardProps {
  profile: Profile;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {profile.bio && (
          <div className="flex items-start gap-2">
            <BookText className="h-5 w-5 text-gray-500" />
            <p className="text-sm">{profile.bio}</p>
          </div>
        )}
        {profile.location && (
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-gray-500" />
            <p className="text-sm">{profile.location}</p>
          </div>
        )}
        {profile.birthDate && (
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-gray-500" />
            <p className="text-sm">
              {new Date(profile.birthDate).toLocaleDateString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}