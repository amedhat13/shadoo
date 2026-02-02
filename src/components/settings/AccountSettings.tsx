import { useState } from 'react';
import { User, Mail, Phone, Building2, Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface AccountData {
  full_name: string;
  email: string;
  phone: string;
  company_name: string;
  avatar_url?: string;
}

// Mock data - will be replaced with real data
const mockAccount: AccountData = {
  full_name: 'Ahmed Hassan',
  email: 'ahmed@shadoo.com',
  phone: '+20 100 123 4567',
  company_name: 'Shadoo Inc.',
  avatar_url: '',
};

export function AccountSettings() {
  const [account, setAccount] = useState<AccountData>(mockAccount);
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const handleSaveProfile = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsLoading(false);
    toast.success('Profile updated successfully');
  };

  const handleChangePassword = async () => {
    setIsPasswordLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsPasswordLoading(false);
    toast.success('Password reset email sent');
  };

  const initials = account.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your personal details and contact information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-border">
              <AvatarImage src={account.avatar_url} alt={account.full_name} />
              <AvatarFallback className="bg-foreground text-background text-lg font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" size="sm" className="gap-2">
                <Camera className="h-4 w-4" />
                Change Photo
              </Button>
              <p className="mt-1 text-xs text-muted-foreground">
                JPG, PNG or GIF. Max 2MB.
              </p>
            </div>
          </div>

          <Separator />

          {/* Form Fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                Full Name
              </Label>
              <Input
                id="full_name"
                value={account.full_name}
                onChange={(e) => setAccount({ ...account, full_name: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={account.email}
                onChange={(e) => setAccount({ ...account, email: e.target.value })}
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                Phone Number
              </Label>
              <Input
                id="phone"
                value={account.phone}
                onChange={(e) => setAccount({ ...account, phone: e.target.value })}
                placeholder="+20 100 000 0000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_name" className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                Company Name
              </Label>
              <Input
                id="company_name"
                value={account.company_name}
                onChange={(e) => setAccount({ ...account, company_name: e.target.value })}
                placeholder="Your company name"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveProfile} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Password */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            Change your password or request a password reset.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Current Password</p>
              <p className="text-sm text-muted-foreground">••••••••••••</p>
            </div>
            <Button variant="outline" onClick={handleChangePassword} disabled={isPasswordLoading}>
              {isPasswordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
