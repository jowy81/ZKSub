// client/src/hooks/useIntMaxClient.ts
import { useState, useCallback } from 'react';
import { IntMaxClient } from 'intmax2-client-sdk';

// Hook to manage IntMax client state and operations
export const useIntMaxClient = () => {
  const [client, setClient] = useState<IntMaxClient | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize IntMax client for testnet
  const initializeClient = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const newClient = await IntMaxClient.init({ environment: 'testnet' });
      setClient(newClient);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize client';
      setError(errorMessage);
      console.error('IntMax Client initialization failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Log in with Metamask
  const login = useCallback(async () => {
    if (!client) {
      setError('Client not initialized');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await client.login();
      setIsLoggedIn(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      console.error('Login failed:', err);
    } finally {
      setLoading(false);
    }
  }, [client]);

  // Log out and reset session
  const logout = useCallback(async () => {
    if (!client) return;
    try {
      setLoading(true);
      await client.logout();
      setIsLoggedIn(false);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed';
      setError(errorMessage);
      console.error('Logout failed:', err);
    } finally {
      setLoading(false);
    }
  }, [client]);

  // Handle subscription payment
  const paySubscription = useCallback(async (creatorAddress: string, amountInUsd: number) => {
    if (!client || !isLoggedIn) {
      setError('Client not initialized or not logged in');
      return false;
    }
    try {
      setLoading(true);
      setError(null);
      // Convert USD to ETH (1 ETH = $2500)
      const amountInEth = amountInUsd / 2500;
      const params = [
        {
          amount: amountInEth, // Amount in ETH
          token: {
            tokenType: 0, // Native token (ETH)
            tokenIndex: 0,
            decimals: 18,
            contractAddress: '0x0000000000000000000000000000000000000000',
            price: 2500, // ETH price in USD
          },
          address: creatorAddress, // INTMAX address of the creator
        },
      ];
      const isWithdrawal = false;
      const txResult = await client.broadcastTransaction(params, isWithdrawal);
      return { hash: txResult.transferDigests[0] }; // Return first digest as transaction hash
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      console.error('Payment failed:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [client, isLoggedIn]);

  return { client, isLoggedIn, loading, error, initializeClient, login, logout, paySubscription };
};