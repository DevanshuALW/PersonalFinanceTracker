import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, LinkIcon, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Define Plaid types here since they're not exported from the Plaid library
interface PlaidLinkOnSuccess {
  (publicToken: string, metadata: any): void;
}

interface PlaidLinkOnExit {
  (error: any | null, metadata?: any): void;
}

interface PlaidLinkOptions {
  token: string;
  onSuccess: PlaidLinkOnSuccess;
  onExit?: PlaidLinkOnExit;
  onLoad?: () => void;
  onEvent?: (eventName: string, metadata: any) => void;
  receivedRedirectUri?: string;
}

interface LinkAccountProps {
  onSuccess: PlaidLinkOnSuccess;
  onExit?: PlaidLinkOnExit;
}

function LinkAccount({ onSuccess, onExit }: LinkAccountProps) {
  const [loading, setLoading] = useState(true);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [plaidAvailable, setPlaidAvailable] = useState(false);
  const { toast } = useToast();

  // Check if Plaid is available
  useEffect(() => {
    async function checkPlaidAvailability() {
      try {
        const response = await apiRequest('GET', '/api/plaid/status');
        const data = await response.json();
        setPlaidAvailable(data.available);
        if (!data.available) {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error checking Plaid status:", error);
        setPlaidAvailable(false);
        setLoading(false);
      }
    }
    
    checkPlaidAvailability();
  }, []);

  const createLinkToken = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiRequest('POST', '/api/plaid/create-link-token');
      const data = await response.json();
      setLinkToken(data.link_token);
    } catch (error) {
      console.error("Error creating link token:", error);
      toast({
        title: "Error",
        description: "Could not connect to banking services. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (plaidAvailable) {
      createLinkToken();
    }
  }, [plaidAvailable, createLinkToken]);

  const handleClick = useCallback(() => {
    if (!linkToken) {
      toast({
        title: "Error",
        description: "Link token not available. Please try again.",
        variant: "destructive",
      });
      return;
    }

    // Dynamically load the Plaid Link script
    const script = document.createElement('script');
    script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
    script.async = true;
    script.onload = () => {
      // @ts-ignore - Plaid is loaded via script
      const handler = window.Plaid.create({
        token: linkToken,
        onSuccess,
        onExit: (err: any) => {
          if (onExit) onExit(err);
        },
      } as PlaidLinkOptions);
      
      handler.open();
    };
    document.body.appendChild(script);
  }, [linkToken, onSuccess, onExit, toast]);

  if (!plaidAvailable) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connect Your Bank Account</CardTitle>
          <CardDescription>
            Bank connection is not available. Contact the administrator.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <LinkIcon className="mr-2 h-5 w-5" />
          Connect Your Bank Account
        </CardTitle>
        <CardDescription>
          Securely connect your bank account to automatically import transactions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleClick}
          disabled={loading || !linkToken}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <LinkIcon className="mr-2 h-4 w-4" />
              Link Bank Account
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function LinkedAccounts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [syncingTransactions, setSyncingTransactions] = useState(false);
  const [plaidAvailable, setPlaidAvailable] = useState(false);
  
  // Check if Plaid is available
  useEffect(() => {
    async function checkPlaidAvailability() {
      try {
        const response = await apiRequest('GET', '/api/plaid/status');
        const data = await response.json();
        setPlaidAvailable(data.available);
      } catch (error) {
        console.error("Error checking Plaid status:", error);
        setPlaidAvailable(false);
      }
    }
    
    checkPlaidAvailability();
  }, []);

  const exchangeTokenMutation = useMutation({
    mutationFn: async (publicToken: string) => {
      const res = await apiRequest("POST", "/api/plaid/exchange-token", {
        public_token: publicToken,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Account Linked Successfully",
        description: "Your bank account has been linked and transactions imported.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Linking Account",
        description: error.message || "There was an error linking your account.",
        variant: "destructive",
      });
    },
  });

  const syncTransactionsMutation = useMutation({
    mutationFn: async (accessToken: string) => {
      const res = await apiRequest("POST", "/api/plaid/sync-transactions", {
        access_token: accessToken,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Transactions Synced",
        description: "Your transactions have been successfully imported.",
      });
      setSyncingTransactions(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error Syncing Transactions",
        description: error.message || "There was an error syncing your transactions.",
        variant: "destructive",
      });
      setSyncingTransactions(false);
    },
  });

  const handlePlaidSuccess = useCallback((publicToken: string, metadata: any) => {
    exchangeTokenMutation.mutate(publicToken);
  }, [exchangeTokenMutation]);

  const handlePlaidExit = useCallback((err: any) => {
    if (err) {
      toast({
        title: "Connection Cancelled",
        description: err.message || "You've cancelled the bank connection process.",
      });
    }
  }, [toast]);

  // This would be expanded in a real application to show linked accounts
  // and allow triggering manual syncs
  const mockLinkedAccounts = [
    { id: 1, name: "Chase Checking", lastSync: "2023-04-20T15:30:00Z" },
    { id: 2, name: "Bank of America Savings", lastSync: "2023-04-19T10:15:00Z" },
  ];

  return (
    <main className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Linked Bank Accounts</h1>
        <p className="text-gray-600">Connect your bank accounts to automatically import transactions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LinkAccount 
          onSuccess={handlePlaidSuccess}
          onExit={handlePlaidExit}
        />

        <Card>
          <CardHeader>
            <CardTitle>Recently Connected Accounts</CardTitle>
            <CardDescription>
              View and manage your connected bank accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!plaidAvailable ? (
              <p className="text-sm text-gray-500">
                Bank connection is not available. Contact the administrator.
              </p>
            ) : mockLinkedAccounts.length === 0 ? (
              <p className="text-sm text-gray-500">
                No accounts connected yet. Use the link button to connect your first account.
              </p>
            ) : (
              <div className="space-y-4">
                {mockLinkedAccounts.map((account) => (
                  <div key={account.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{account.name}</h3>
                      <p className="text-xs text-gray-500">
                        Last sync: {new Date(account.lastSync).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSyncingTransactions(true);
                        // This is a mock - in a real app you'd retrieve the actual token
                        syncTransactionsMutation.mutate("mock_access_token");
                      }}
                      disabled={syncingTransactions}
                    >
                      {syncingTransactions ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      <span className="ml-2">Sync</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}