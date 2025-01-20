import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_URL } from "@/config/constants";

interface Role {
  id: number;
  name: string;
  description: string;
}

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  hasInstrument: boolean;
  roleId: number;
}

export default function RegisterForm() {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    hasInstrument: false,
    roleId: 1
  });
  
  const [roles, setRoles] = useState<Role[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  // Charger les rôles disponibles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/roles`);
        setRoles(response.data);
      } catch (error) {
        console.error("Erreur lors du chargement des rôles:", error);
        setError("Impossible de charger les rôles disponibles");
      }
    };
    fetchRoles();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'radio' && name === 'hasInstrument') {
      const isOwner = value === 'true';
      setFormData(prev => ({
        ...prev,
        hasInstrument: isOwner,
        roleId: isOwner ? 5 : prev.roleId // Si propriétaire, force le rôle 5
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'roleId' ? parseInt(value) : value
      }));
    }
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { username, email, password, confirmPassword, hasInstrument, roleId } = formData;

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    try {
      // Si l'utilisateur est propriétaire, on force le rôle 5
      const finalRoleId = hasInstrument ? 5 : roleId;

      const requestData = {
        username,
        email,
        password,
        has_instrument: hasInstrument,
        roleId: finalRoleId
      };

      console.log("Données envoyées à l'API:", requestData);

      const response = await axios.post(
        `${API_URL}/auth/register`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("Réponse du serveur:", response.data);

      if (response.status === 201) {
        router.push("/login");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Erreur détaillée:", {
          status: error.response?.status,
          data: error.response?.data,
        });
        setError(error.response?.data?.message || "Erreur lors de l'inscription");
      } else {
        console.error("Erreur non-Axios:", error);
        setError("Une erreur inattendue est survenue");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="mt-8 space-y-6">
      <div className="rounded-md -space-y-px">
        <div className="mb-4">
          <label htmlFor="username" className="block mb-2 text-orange-600">
            Nom d&apos;utilisateur
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded text-black"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block mb-2 text-orange-600">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded text-black"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block mb-2 text-red-600">
            Mot de passe
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={8}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="confirmPassword" className="block mb-2 text-red-600">
            Confirmer le mot de passe
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            minLength={8}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-red-600">
            Êtes-vous propriétaire d&apos;un instrument ?
          </label>
          <div className="flex gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="hasInstrument"
                value="true"
                checked={formData.hasInstrument === true}
                onChange={handleChange}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span className="ml-2">Oui</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="hasInstrument"
                value="false"
                checked={formData.hasInstrument === false}
                onChange={handleChange}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span className="ml-2">Non</span>
            </label>
          </div>
        </div>

        {/* Sélection du rôle (désactivé si propriétaire) */}
        <div className="mb-4">
          <label htmlFor="roleId" className="block mb-2 text-orange-600">
            Type de compte
          </label>
          <select
            id="roleId"
            name="roleId"
            value={formData.hasInstrument ? 5 : formData.roleId}
            onChange={handleChange}
            disabled={formData.hasInstrument}
            className={`w-full px-3 py-2 border rounded text-black ${
              formData.hasInstrument ? 'bg-gray-100' : ''
            }`}
          >
            {roles.map(role => (
              <option key={role.id} value={role.id}>
                {role.description || role.name}
              </option>
            ))}
          </select>
          {formData.hasInstrument && (
            <p className="mt-1 text-sm text-blue-600">
              En tant que propriétaire, votre rôle est automatiquement défini comme &quot;Propriétaire&quot;
            </p>
          )}
        </div>

        {/* Affichage du rôle final */}
        <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
          <p className="font-semibold">Rôle sélectionné :</p>
          <p>{formData.hasInstrument 
            ? 'Propriétaire (Rôle 5)'
            : `${roles.find(r => r.id === formData.roleId)?.description || 'Utilisateur'}`}
          </p>
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-center">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`w-full ${
          loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
        } text-white py-2 rounded`}
      >
        {loading ? "Inscription en cours..." : "S'inscrire"}
      </button>

      {/* Debug info */}
      {/* <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
        <pre>
          {JSON.stringify({
            formData,
            rolesFetched: roles.length > 0,
            finalRole: formData.hasInstrument ? 5 : formData.roleId
          }, null, 2)}
        </pre>
      </div> */}
    </form>
  );
}