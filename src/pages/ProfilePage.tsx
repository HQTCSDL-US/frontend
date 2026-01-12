import { mockBookedTickets } from '@/data/mockData';
import TicketCard from '@/components/profile/TicketCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Ticket, User, Calendar, CreditCard } from 'lucide-react';

const ProfilePage = () => {
  const totalTickets = mockBookedTickets.length;
  const paidTickets = mockBookedTickets.filter(t => t.status === 'PAID').length;
  const pendingTickets = mockBookedTickets.filter(t => t.status === 'BOOKED').length;
  const totalSpent = mockBookedTickets
    .filter(t => t.status === 'PAID')
    .reduce((sum, t) => sum + t.price, 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Profile Header */}
      <div className="railway-gradient py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20 border-4 border-primary-foreground/20">
              <AvatarFallback className="bg-accent text-accent-foreground text-2xl font-display font-bold">
                JD
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-display text-3xl font-bold text-primary-foreground">
                John Doe
              </h1>
              <p className="text-primary-foreground/80 flex items-center gap-2 mt-1">
                <User className="h-4 w-4" />
                john.doe@email.com
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="shadow-elevated">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Ticket className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Tickets</p>
                <p className="font-display text-2xl font-bold">{totalTickets}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elevated">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Paid</p>
                <p className="font-display text-2xl font-bold text-success">{paidTickets}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elevated">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <Ticket className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="font-display text-2xl font-bold text-warning">{pendingTickets}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elevated">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="font-display text-lg font-bold text-accent">{formatPrice(totalSpent)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tickets Section */}
      <div className="container mx-auto px-4 pb-12">
        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Ticket className="h-5 w-5 text-primary" />
              Tickets For You
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockBookedTickets.length > 0 ? (
              mockBookedTickets.map((ticket, index) => (
                <div key={ticket.id} style={{ animationDelay: `${index * 100}ms` }}>
                  <TicketCard ticket={ticket} />
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>You haven't booked any tickets yet.</p>
                <p className="text-sm mt-1">Start by browsing available trips!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
