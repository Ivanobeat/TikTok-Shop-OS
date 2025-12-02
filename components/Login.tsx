import React, { useState } from 'react';
import { UserRole } from '../types';
import { db } from '../services/mockDatabase';

interface LoginProps {
  onLogin: (role: UserRole) => void;
  onBack: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const user = db.authenticate(username, password);
      
      if (user) {
        onLogin(user.role);
      } else {
        setError('Credenciais inválidas. Verifique o usuário e senha.');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao entrar.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">T</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Acesso ao Bot</h2>
          <p className="text-slate-500 text-sm">Insere o Login e Senha que recebeste após a compra.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ID de Usuário / Email</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="ex: user_4829"
            />
          </div>
           <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Senha Temporária</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>
          
          {error && <div className="bg-red-50 text-red-500 p-3 rounded text-xs text-center border border-red-100">{error}</div>}

          <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">
            Entrar no Painel
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={onBack} className="text-sm text-slate-400 hover:text-slate-600">
            &larr; Voltar à Página Inicial
          </button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-100 text-xs text-slate-400 text-center space-y-1">
            <p>Admin: <b>admin</b> / <b>admin</b></p>
            <p>Cliente Demo: <b>cliente</b> / <b>123</b></p>
        </div>
      </div>
    </div>
  );
};