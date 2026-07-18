// ========================================================
// SUPER ADMIN DASHBOARD RESPONSIBO - ProLife v3.1 (Glassmorphic UI)
// ========================================================

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const API = 'http://127.0.0.1:5000';

/* ──────────────────────────────────────────────────
   ÍCONOS SVG REUTILIZABLES (Diseño Coherente)
────────────────────────────────────────────────── */
const AdminIcon = {
  overview: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" />
    </svg>
  ),
  users: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  logs: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  ai: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <rect x="2" y="2" width="20" height="20" rx="4" /><path d="M8 12h8M12 8v8" />
    </svg>
  ),
  shield: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  logout: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  menu: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
      <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
};

function cardStyle(t) {
  return {
    background: t.card,
    backdropFilter: 'blur(14px)',
    border: `1px solid ${t.border}`,
    borderRadius: 18,
    padding: '24px 26px',
    marginBottom: 20,
  };
}

function SectionTitle({ icon, label, color = '#278BF5', t }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
      <div style={{
        background: `linear-gradient(135deg,${color}33,${color}11)`,
        border: `1px solid ${color}44`,
        borderRadius: 10, width: 36, height: 36,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: color,
      }}>{icon}</div>
      <span style={{ color: t.text, fontWeight: 700, fontSize: 18, letterSpacing: '-0.3px' }}>{label}</span>
    </div>
  );
}

/* ──────────────────────────────────────────────────
   COMPONENTE PRINCIPAL (RESPONSIVO)
────────────────────────────────────────────────── */
export default function SuperAdminDashboard({ user, onLogout, t }) {
  const [tab, setTab] = useState('overview');
  const [usuarios, setUsuarios] = useState([]);
  const [logsGlobales, setLogsGlobales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ text: '', type: '' });
  
  // Estados para diseño responsivo móvil
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const TABS = [
    { id: 'overview', label: 'Resumen Global', icon: <AdminIcon.overview /> },
    { id: 'usuarios', label: 'Gestión de Usuarios', icon: <AdminIcon.users /> },
    { id: 'logs', label: 'Logs Globales', icon: <AdminIcon.logs /> },
    { id: 'modelos', label: 'Modelos de IA', icon: <AdminIcon.ai /> },
    { id: 'unsupervised', label: 'Análisis No Supervisado', icon: <AdminIcon.ai /> },   // 
  ];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 960);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (tab === 'usuarios') cargarUsuarios();
    if (tab === 'logs') cargarLogsGlobales();
    setMenuOpen(false); // Cierra menú móvil al cambiar de pestaña
  }, [tab]);

  const showMessage = (text, type = 'success') => {
    setMensaje({ text, type });
    setTimeout(() => setMensaje({ text: '', type: '' }), 4000);
  };

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const r = await axios.get(`${API}/usuarios`);
      setUsuarios(r.data);
    } catch (e) {
      showMessage("Error al cargar usuarios", "error");
    } finally {
      setLoading(false);
    }
  };

  const cambiarRol = async (id_usuario, nuevoRol) => {
    if (!confirm(`¿Cambiar rol del usuario ${id_usuario} a ${nuevoRol}?`)) return;
    try {
      await axios.post(`${API}/admin/cambiar_rol/${id_usuario}`, { rol: nuevoRol });
      showMessage(`✅ Rol cambiado a ${nuevoRol} exitosamente`);
      cargarUsuarios();
    } catch (e) {
      showMessage("❌ Error al cambiar el rol", "error");
    }
  };

  const cargarLogsGlobales = async () => {
    setLoading(true);
    try {
      const r = await axios.get(`${API}/historial_fatiga/1?limit=50`);
      setLogsGlobales(r.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      background: t.bg, 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row',
      fontFamily: "'Sora','Inter',sans-serif", 
      color: t.text 
    }}>
      
      {/* BARRA SUPERIOR (Solo en Móviles) */}
      {isMobile && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '16px 24px', 
          background: t.sideBar, 
          borderBottom: `1px solid ${t.border}`,
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backdropFilter: 'blur(20px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: t.primary, fontWeight: 800, fontSize: 18 }}>
            <span style={{ color: t.accent }}><AdminIcon.shield /></span>ProLife Admin
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'transparent', border: 'none', color: t.text, cursor: 'pointer' }}>
            <AdminIcon.menu />
          </button>
        </div>
      )}

      {/* SIDEBAR (Escritorio o Desplegable Móvil) */}
      <aside style={{ 
        width: isMobile ? '100%' : 280, 
        background: t.sideBar, 
        backdropFilter: 'blur(20px)', 
        borderRight: isMobile ? 'none' : `1px solid ${t.border}`, 
        borderBottom: isMobile ? `1px solid ${t.border}` : 'none',
        padding: '24px 0', 
        display: (isMobile && !menuOpen) ? 'none' : 'flex', 
        flexDirection: 'column',
        position: isMobile ? 'relative' : 'sticky',
        top: isMobile ? 0 : 0,
        height: isMobile ? 'auto' : '100vh'
      }}>
        {!isMobile && (
          <div style={{ padding: '0 28px 28px', borderBottom: `1px solid ${t.border}`, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: t.primary, fontWeight: 800, fontSize: 22, letterSpacing: '-0.5px' }}>
              <span style={{ color: t.accent }}><AdminIcon.shield /></span>ProLife Admin
            </div>
            <div style={{ color: t.textMuted, fontSize: 13, marginTop: 6 }}>{user?.nombre} • Master</div>
          </div>
        )}

        {TABS.map(tb => (
          <button key={tb.id} onClick={() => setTab(tb.id)} style={{
            width: '100%', textAlign: 'left', padding: '15px 28px', background: tab === tb.id ? `${t.primary}18` : 'transparent',
            border: 'none', borderLeft: tab === tb.id ? `4px solid ${t.primary}` : '4px solid transparent',
            color: tab === tb.id ? t.text : t.textMuted, fontWeight: tab === tb.id ? 700 : 500, cursor: 'pointer', fontSize: 14,
            display: 'flex', alignItems: 'center', gap: 12, transition: 'all .2s', fontFamily: "'Sora','Inter',sans-serif"
          }}>
            <span style={{ color: tab === tb.id ? t.primary : t.textMuted }}>{tb.icon}</span>
            {tb.label}
          </button>
        ))}

        <button onClick={onLogout} style={{
          marginTop: isMobile ? 20 : 'auto', margin: '28px', padding: '13px', borderRadius: 12, 
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', 
          color: '#ef4444', fontWeight: 700, fontSize: 13, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'all .2s', fontFamily: "'Sora','Inter',sans-serif"
        }}>
          <AdminIcon.logout /> Cerrar Sesión
        </button>
      </aside>

      {/* MAIN CONTENT CONTAINER */}
      <main style={{ flex: 1, padding: isMobile ? '24px 20px' : '40px 48px', overflowY: 'auto' }}>
        {mensaje.text && (
          <div style={{ padding: '14px 20px', borderRadius: 12, marginBottom: 24, background: mensaje.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: mensaje.type === 'success' ? '#10b981' : '#ef4444', fontSize: 14, fontWeight: 600, border: `1px solid ${mensaje.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
            {mensaje.text}
          </div>
        )}

        {tab === 'overview' && <AdminOverview t={t} isMobile={isMobile} />}
        {tab === 'usuarios' && <AdminUsuarios usuarios={usuarios} loading={loading} cambiarRol={cambiarRol} t={t} />}
        {tab === 'logs' && <AdminLogs logs={logsGlobales} loading={loading} t={t} />}
        {tab === 'modelos' && <AdminModelos t={t} />}
        {tab === 'unsupervised' && <AdminUnsupervised t={t} />}
      </main>
    </div>
  );
}

/* ──────────────────────────────────────────────────
   SUBCOMPONENTES GESTORES (RESPONSIVOS)
────────────────────────────────────────────────── */

function AdminOverview({ t, isMobile }) {
  const [stats, setStats] = useState({ totalUsuarios: 0 });
  const [fatigaData, setFatigaData] = useState([]);

  useEffect(() => {
    axios.get(`${API}/usuarios`)
      .then(r => setStats({ totalUsuarios: r.data.length }))
      .catch(e => console.error(e));
      
    setFatigaData([
      { hora: '8:00', fatiga: 1.2 },
      { hora: '10:00', fatiga: 1.8 },
      { hora: '12:00', fatiga: 2.4 },
      { hora: '14:00', fatiga: 2.1 },
      { hora: '16:00', fatiga: 2.7 },
      { hora: '18:00', fatiga: 1.9 },
    ]);
  }, []);

  return (
    <div>
      <SectionTitle icon={<AdminIcon.overview />} label="Resumen Global de la Plataforma" color={t.primary} t={t} />

      <div style={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row', 
        gap: 20, 
        alignItems: 'stretch' 
      }}>
        {/* Tarjeta de estadísticas */}
        <div style={{ 
          ...cardStyle(t), 
          background: `${t.primary}0a`, 
          border: `1px solid ${t.primary}28`, 
          textAlign: 'center', 
          padding: '36px 20px',
          flex: isMobile ? 'none' : '1'
        }}>
          <div style={{ fontSize: 52, fontWeight: 800, color: t.primary, letterSpacing: '-2px' }}>{stats.totalUsuarios}</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: t.text, marginTop: 6 }}>Usuarios Totales</div>
          <div style={{ fontSize: 11, color: t.textMuted, marginTop: 4 }}>Cuentas activas en ProLife</div>
        </div>

        {/* Gráfica de Evolución de Fatiga */}
        <div style={{ ...cardStyle(t), flex: isMobile ? 'none' : '2', minWidth: 0 }}>
          <SectionTitle icon={<AdminIcon.logs />} label="Evolución Promedio de Fatiga" color="#f59e0b" t={t} />
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fatigaData} margin={{ left: -20, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.border} />
                <XAxis dataKey="hora" stroke={t.textMuted} style={{ fontSize: 11 }} />
                <YAxis domain={[1, 3]} stroke={t.textMuted} style={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="fatiga" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminUsuarios({ usuarios, loading, cambiarRol, t }) {
  return (
    <div style={cardStyle(t)}>
      <SectionTitle icon={<AdminIcon.users />} label="Control de Acceso y Roles" color={t.accent} t={t} />
      {loading ? (
        <p style={{ color: t.textMuted, fontSize: 13 }}>Cargando usuarios de la base de datos...</p>
      ) : (
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 600 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${t.border}`, color: t.textMuted }}>
                <th style={{ padding: '12px', textAlign: 'left', textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.5px' }}>ID</th>
                <th style={{ padding: '12px', textAlign: 'left', textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.5px' }}>Nombre</th>
                <th style={{ padding: '12px', textAlign: 'left', textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.5px' }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left', textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.5px' }}>Rol</th>
                <th style={{ padding: '12px', textAlign: 'center', textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.5px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id_usuario} style={{ borderBottom: `1px solid ${t.border}44`, color: t.text }}>
                  <td style={{ padding: '14px 12px', fontWeight: 600, color: t.textMuted }}>#{u.id_usuario}</td>
                  <td style={{ padding: '14px 12px', fontWeight: 600 }}>{u.nombre}</td>
                  <td style={{ padding: '14px 12px', color: t.textMuted }}>{u.email}</td>
                  <td style={{ padding: '14px 12px' }}>
                    <span style={{
                      padding: '4px 12px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                      background: u.rol === 'super_admin' ? 'rgba(39,139,245,0.15)' : 'rgba(16,185,129,0.15)',
                      color: u.rol === 'super_admin' ? t.primary : '#10b981',
                      border: `1px solid ${u.rol === 'super_admin' ? 'rgba(39,139,245,0.3)' : 'rgba(16,185,129,0.3)'}`
                    }}>
                      {u.rol === 'super_admin' ? 'ADMIN' : 'USER'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <button onClick={() => cambiarRol(u.id_usuario, 'super_admin')} style={{ marginRight: 8, padding: '6px 12px', background: `${t.primary}22`, border: `1px solid ${t.primary}44`, color: t.primary, borderRadius: 20, cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: "'Sora',sans-serif" }}>
                      Promover
                    </button>
                    <button onClick={() => cambiarRol(u.id_usuario, 'usuario')} style={{ padding: '6px 12px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', borderRadius: 20, cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: "'Sora',sans-serif" }}>
                      Degradar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AdminLogs({ logs, loading, t }) {
  return (
    <div style={cardStyle(t)}>
      <SectionTitle icon={<AdminIcon.logs />} label="Auditoría Global de Eventos (Fatiga)" color="#7c3aed" t={t} />
      {loading ? (
        <p style={{ color: t.textMuted, fontSize: 13 }}>Sincronizando flujos de datos en tiempo real...</p>
      ) : (
        <div style={{ background: 'rgba(0,0,0,0.08)', borderRadius: 12, padding: 16, maxHeight: '50vh', overflowY: 'auto', border: `1px solid ${t.border}` }}>
          {logs.length === 0 ? (
            <p style={{ color: t.textMuted, fontSize: 13, textAlign: 'center', padding: 20 }}>No se registran eventos globales recientes.</p>
          ) : (
            logs.map((log, i) => (
              <div key={i} style={{ padding: '12px 8px', borderBottom: `1px solid ${t.border}22`, color: t.text, fontSize: 13, display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <div>
                  <span style={{ fontWeight: 700, color: t.primary }}>ID Usuario: #{log.id_usuario}</span>
                  <span style={{ color: t.textMuted, marginLeft: 12 }}>• EAR: <strong>{log.ear_value}</strong></span>
                </div>
                <span style={{
                  padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                  background: log.nivel_fatiga > 2 ? 'rgba(239,68,68,0.15)' : 'rgba(39,139,245,0.15)',
                  color: log.nivel_fatiga > 2 ? '#ef4444' : t.primary
                }}>
                  Nivel: {log.nivel_fatiga}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function AdminModelos({ t }) {
  const [idUser, setIdUser] = useState('');
  const [tipoModelo, setTipoModelo] = useState('clasificacion');
  const [algoritmo, setAlgoritmo] = useState('random_forest');
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);

  const entrenar = async () => {
    if (!idUser) {
      alert("Por favor ingresa un ID de usuario");
      return;
    }
    setLoading(true);
    setResultado(null);

    try {
      let endpoint = '';
      let body = {};

      if (tipoModelo === 'clasificacion') {
        endpoint = `${API}/modelo/clasificacion/${idUser}`;
        body = { algoritmo };
      } 
      else if (tipoModelo === 'regresion_simple' || tipoModelo === 'regresion_multiple') {
        const historialRes = await axios.get(`${API}/historial_fatiga/${idUser}?limit=100`);
        const logs = historialRes.data;

        if (logs.length < 8) {
          alert("El usuario necesita al menos 8 registros de fatiga para entrenar regresión");
          setLoading(false);
          return;
        }

        const X_simple = logs.map(log => [log.ear_value || 0]);
        const y = logs.map(log => log.nivel_fatiga);

        if (tipoModelo === 'regresion_simple') {
          endpoint = `${API}/modelo/regresion/simple`;
          body = { X: X_simple, y: y };
        } else {
          const X_multiple = logs.map(log => {
            const fecha = new Date(log.fecha_hora);
            const hora = fecha.getHours();
            return [log.ear_value || 0, hora];
          });
          endpoint = `${API}/modelo/regresion/multiple`;
          body = { X: X_multiple, y: y };
        }
      }

      const r = await axios.post(endpoint, body);
      setResultado(r.data);
    } catch (e) {
      console.error(e);
      setResultado({ 
        error: e.response?.data?.error || e.message || 'Error al procesar los datos del usuario' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SectionTitle icon={<AdminIcon.ai />} label="Modelos de Machine Learning" color="#00e5c8" t={t} />
      
      <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 16, padding: '24px 20px', maxWidth: 680 }}>
        
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 8, color: t.textMuted, fontWeight: 600, fontSize: 13 }}>Tipo de Modelo</label>
          <select 
            value={tipoModelo} 
            onChange={e => setTipoModelo(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: `1px solid ${t.border}`, color: t.text, fontFamily: "'Sora',sans-serif", fontSize: 13, outline: 'none' }}
          >
            <option value="clasificacion" style={{ background: t.sideBar }}>Clasificación (Nivel de Fatiga)</option>
            <option value="regresion_simple" style={{ background: t.sideBar }}>Regresión Lineal Simple (EAR → Fatiga)</option>
            <option value="regresion_multiple" style={{ background: t.sideBar }}>Regresión Lineal Múltiple (EAR + Hora)</option>
          </select>
        </div>

        {tipoModelo === 'clasificacion' && (
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, color: t.textMuted, fontWeight: 600, fontSize: 13 }}>Algoritmo</label>
            <select value={algoritmo} onChange={e => setAlgoritmo(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: `1px solid ${t.border}`, color: t.text, fontFamily: "'Sora',sans-serif", fontSize: 13, outline: 'none' }}>
              <option value="random_forest" style={{ background: t.sideBar }}>Random Forest</option>
              <option value="decision_tree" style={{ background: t.sideBar }}>Árbol de Decisión</option>
              <option value="svm" style={{ background: t.sideBar }}>SVM</option>
            </select>
          </div>
        )}

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 8, color: t.textMuted, fontWeight: 600, fontSize: 13 }}>ID de Usuario</label>
          <input 
            type="number"
            value={idUser} 
            onChange={e => setIdUser(e.target.value)} 
            placeholder="Ej: 12" 
            style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: `1px solid ${t.border}`, color: t.text, fontFamily: "'Sora',sans-serif", fontSize: 13, outline: 'none' }} 
          />
        </div>

        <button 
          onClick={entrenar} 
          disabled={loading || !idUser}
          style={{
            width: '100%', padding: '15px', background: `linear-gradient(135deg,${t.primary},#00c4b8)`,
            color: 'white', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontSize: 14,
            opacity: (loading || !idUser) ? 0.6 : 1, transition: 'all 0.2s', fontFamily: "'Sora',sans-serif"
          }}
        >
          {loading ? '⏳ Cargando datos...' : '🧠 Cargar datos y entrenar modelo'}
        </button>

        {resultado && (
          <div style={{ marginTop: 28, padding: 16, background: resultado.error ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)', borderRadius: 14, border: `1px solid ${resultado.error ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}` }}>
            {resultado.error ? (
              <div style={{ color: '#ef4444', fontWeight: 600, fontSize: 13 }}>{resultado.error}</div>
            ) : (
              <div>
                <h4 style={{ color: '#10b981', marginBottom: 12, fontSize: 14, fontWeight: 700 }}>✅ Resultados del Modelo</h4>
                <pre style={{ 
                  background: 'rgba(0,0,0,0.4)', 
                  padding: 12, 
                  borderRadius: 10, 
                  fontSize: 12, 
                  overflowX: 'auto',
                  whiteSpace: 'pre-wrap',
                  color: '#fff',
                  margin: 0,
                  fontFamily: 'monospace'
                }}>
                  {JSON.stringify(resultado, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminUnsupervised({ t }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(''); // Para filtrar por usuario
  const [error, setError] = useState('');

  const cargarAnalisis = async () => {
    setLoading(true);
    setError('');
    let url = `${API}/superadmin/analisis_unsupervised`;
    
    // Agregar filtro si se seleccionó un usuario
    if (selectedUser && selectedUser.trim() !== '') {
      url += `?id_usuario=${selectedUser}`;
    }

    try {
      const res = await axios.get(url);
      setData(res.data);
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.error || "Error al cargar el análisis no supervisado");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  // Cargar al montar y cuando cambie el usuario seleccionado
  useEffect(() => {
    cargarAnalisis();
  }, [selectedUser]);

  if (loading) return <p style={{ color: t.textMuted }}>Cargando análisis de clustering...</p>;
  
  return (
    <div>
      <SectionTitle 
        icon={<AdminIcon.ai />} 
        label="Análisis No Supervisado (K-Means + PCA)" 
        color="#8b5cf6" 
        t={t} 
      />

      {/* Filtro por Usuario */}
      <div style={{ marginBottom: 24, maxWidth: 400 }}>
        <label style={{ display: 'block', marginBottom: 8, color: t.textMuted, fontWeight: 600 }}>
          Filtrar por ID de Usuario (dejar vacío para ver todos)
        </label>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="number"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            placeholder="Ej: 5"
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 10,
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${t.border}`,
              color: t.text,
              fontSize: 14,
              outline: 'none'
            }}
          />
          <button
            onClick={cargarAnalisis}
            style={{
              padding: '12px 20px',
              background: t.primary,
              color: 'white',
              border: 'none',
              borderRadius: 10,
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Actualizar
          </button>
        </div>
      </div>

      {error && (
        <div style={{ color: '#ef4444', padding: 16, background: 'rgba(239,68,68,0.1)', borderRadius: 12, marginBottom: 20 }}>
          {error}
        </div>
      )}

      {data?.success ? (
        <>
          <div style={{ marginBottom: 16, color: t.textMuted }}>
            <strong>{data.tipo_analisis}</strong> — {data.n_muestras} registros
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: 20 }}>
            
            {/* Gráfico del Codo */}
            <div style={cardStyle(t)}>
              <h3>Método del Codo (WCSS)</h3>
              <img 
                src={`data:image/png;base64,${data.graphs.elbow}`} 
                alt="Elbow" 
                style={{ width: '100%', borderRadius: 12 }} 
              />
            </div>

            {/* Gráfico de Silueta */}
            <div style={cardStyle(t)}>
              <h3>Índice de Silueta</h3>
              <img 
                src={`data:image/png;base64,${data.graphs.silhouette}`} 
                alt="Silhouette" 
                style={{ width: '100%', borderRadius: 12 }} 
              />
            </div>

            {/* PCA Clusters */}
            <div style={{ ...cardStyle(t), gridColumn: '1 / -1' }}>
              <h3>Visualización PCA con Clusters (K = {data.best_k})</h3>
              <img 
                src={`data:image/png;base64,${data.graphs.pca_clusters}`} 
                alt="PCA Clusters" 
                style={{ width: '100%', borderRadius: 12 }} 
              />
            </div>
          </div>

          {/* Estadísticas */}
          <div style={cardStyle(t)}>
            <h3>Estadísticas por Cluster</h3>
            <pre style={{ 
              background: '#1f2937', 
              color: '#e5e7eb', 
              padding: 16, 
              borderRadius: 12, 
              overflowX: 'auto',
              fontSize: 13
            }}>
              {JSON.stringify(data.cluster_stats, null, 2)}
            </pre>
          </div>
        </>
      ) : (
        !loading && <p style={{ color: t.textMuted }}>No se pudieron cargar los datos.</p>
      )}
    </div>
  );
}