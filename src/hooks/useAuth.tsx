import { useState, useEffect } from "react";
import { api } from "@/services/axios";

interface UserData {
	email: string;
	username: string;
	role: string[];
	token: string;
}

export const useAuth = () => {
	const [userData, setUserData] = useState<UserData | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const login = async (email: string, password: string) => {
		try {
			const response = await api.post("/auth/login", { email, password });

			const userData = {
				email,
				username: response.data.username || email.split("@")[0],
				role: response.data.roles || [],
				token: response.data.token,
			};

			localStorage.setItem("token", response.data.token);
			localStorage.setItem("user", JSON.stringify(userData));
			api.defaults.headers.common[
				"Authorization"
			] = `Bearer ${response.data.token}`;

			setUserData(userData);
			return userData;
		} catch (error) {
			throw error;
		}
	};

	const logout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		delete api.defaults.headers.common["Authorization"];
		setUserData(null);
	};

	useEffect(() => {
		const storedUser = localStorage.getItem("user");
		if (storedUser) {
			setUserData(JSON.parse(storedUser));
		}
		setIsLoading(false);
	}, []);

	return { userData, isLoading, login, logout };
};
