export const useAuthentication = () => {
    const isAuthenticated = useCallback(() => {
      return !!localStorage.getItem("userId");
    }, []);
  
    const checkToken = useCallback(() => {
      // ... logique de vérification du token
    }, []);
  
    return { isAuthenticated, checkToken };
  };