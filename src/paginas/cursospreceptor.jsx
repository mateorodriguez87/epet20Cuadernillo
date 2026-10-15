import React, { useState, useEffect } from 'react';
import '../estilos/cursospreceptor.css';
import {
  GraduationCap,
  Calendar,
  ChevronDown,
  Search,
  Plus,
  Users,
  ChevronRight,
  Info,
  BookOpen,
  Mail,
  FileText,
  Eye,
  MessageSquare,
  Home,
  Bell,
  FileClock,
  LogOut,
  ArrowLeft,
  ArrowRight,
  UserPlus,
  User
} from 'lucide-react';

export default function CuadernoComunicaciones() {
  const [currentView, setCurrentView] = useState('cursos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('todos');
  const [activeTab, setActiveTab] = useState('alumnos');
  const [currentDate, setCurrentDate] = useState('');

  // 1. Fecha actual dinámica en español (se actualiza automáticamente)
  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const weekday = now.toLocaleDateString('es-ES', { weekday: 'long' });
      const day = now.getDate();
      const month = now.toLocaleDateString('es-ES', { month: 'long' });
      const year = now.getFullYear();

      const capWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
      const capMonth = month.charAt(0).toUpperCase() + month.slice(1);

      setCurrentDate(`${capWeekday} ${day} de ${capMonth} ${year}`);
    };

    updateDate();
    const interval = setInterval(updateDate, 60000);
    return () => clearInterval(interval);
  }, []);

  // 2. Cursos: inicia vacío con el botón "Agregar curso"
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  // 3. Alumnos: inicia vacío (sin alumnos precargados)
  const [alumnos, setAlumnos] = useState([]);

  const currentCourse = courses.find((c) => c.id === selectedCourseId) || null;

  const handleAddCourse = () => {
    const name = prompt('Nombre del curso (Ej: 1° Año Tercera):');
    if (name) {
      const newCourse = {
        id: Date.now().toString(),
        name,
        shift: 'Turno Mañana',
        students: 0,
        pending: 0,
        notes: 0,
        border: 'border-l-blue-600',
        iconBg: 'bg-blue-50 text-blue-600',
      };
      setCourses((prev) => [...prev, newCourse]);
      setSelectedCourseId(newCourse.id);
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans antialiased text-slate-800">
      {/* PANEL IZQUIERDO: MÁS CHICO (w-44) Y BOTONES PEQUEÑOS */}
      <aside className="w-44 bg-[#1b3187] text-white flex flex-col justify-between shrink-0 select-none">
        <div className="pt-5 px-3">
          <div className="leading-tight tracking-wide font-extrabold uppercase text-[11px] text-white/95">
            <div>Cuaderno de</div>
            <div>Comunicaciones</div>
            <div className="text-[#64b5f6] text-[10px] font-bold tracking-widest mt-0.5">
              DIGITAL
            </div>
          </div>

          <nav className="mt-6 space-y-1">
            {[
              { id: 'inicio', label: 'Inicio', icon: Home },
              { id: 'cursos', label: 'Cursos', icon: GraduationCap },
              { id: 'alumnos', label: 'Alumnos', icon: Users },
              { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
              { id: 'historial', label: 'Historial', icon: FileClock },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-white/20 text-white shadow-xs ring-1 ring-white/25 font-semibold backdrop-blur-sm'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-3 border-t border-white/10">
          <button className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer">
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* ENCABEZADO SUPERIOR: FECHA ACTUAL DINÁMICA Y SIN NOMBRE DEL PRECEPTOR */}
        <header className="bg-white border-b border-slate-100 px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-blue-900">
              <GraduationCap className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 leading-tight">Cursos</h1>
              <nav className="text-[11px] text-slate-400 font-medium">
                <span>Inicio</span>
                <span className="mx-1">›</span>
                <span className="text-slate-500">Cursos</span>
              </nav>
            </div>
          </div>

          <div className="flex items-center gap-5">
            {/* Fecha Actual Dinámica */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{currentDate}</span>
            </div>

            {/* Perfil sin nombre personal de preceptor */}
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-[#1b3187] text-white flex items-center justify-center shadow-xs">
                <User className="w-4 h-4" />
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-800 leading-tight">Preceptoría</div>
                <div className="text-[10px] text-slate-400 font-medium">Panel Escolar</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </div>
          </div>
        </header>

        {/* BARRA DE FILTROS */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 bg-white border-b border-slate-100">
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar curso..."
                className="w-full bg-[#f8fafc] text-xs text-slate-700 pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="appearance-none bg-[#f8fafc] text-xs text-slate-700 pl-3 pr-8 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer font-medium"
              >
                <option value="todos">Todos los años</option>
                <option value="1">1° Año</option>
                <option value="2">2° Año</option>
                <option value="3">3° Año</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <button
            onClick={handleAddCourse}
            className="inline-flex items-center gap-1.5 bg-[#1b3187] hover:bg-[#15276e] text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Nuevo curso</span>
          </button>
        </div>

        {/* CONTENIDO PRINCIPAL: DOS COLUMNAS */}
        <main className="flex-1 p-6 flex flex-col lg:flex-row gap-6">
          {/* COLUMNA IZQUIERDA: MIS CURSOS ASIGNADOS CON BOTÓN "AGREGAR CURSO" */}
          <div className="w-full lg:w-72 xl:w-80 flex flex-col gap-3 shrink-0">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Mis cursos asignados
            </h2>

            {courses.length === 0 ? (
              <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs text-center flex flex-col items-center justify-center py-6">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-[#1b3187] flex items-center justify-center mb-3">
                  <Users className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-500 mb-3 font-medium">
                  No tienes cursos asignados aún.
                </p>
                <button
                  type="button"
                  onClick={handleAddCourse}
                  className="w-full inline-flex items-center justify-center gap-1.5 bg-[#1b3187] hover:bg-[#15276e] text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Agregar curso</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {courses.map((course) => {
                  const isSelected = selectedCourseId === course.id;
                  return (
                    <div
                      key={course.id}
                      onClick={() => setSelectedCourseId(course.id)}
                      className={`w-full bg-white rounded-xl p-3 border border-l-4 border-slate-200 ${course.border} shadow-2xs hover:shadow-xs transition cursor-pointer flex items-center justify-between ${
                        isSelected ? 'bg-blue-50/40 ring-1 ring-blue-300' : 'hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${course.iconBg}`}>
                          <Users className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-bold text-slate-800 leading-tight">
                            {course.name}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {course.students} alumnos
                          </div>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-300'}`} />
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={handleAddCourse}
                  className="w-full inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 border border-dashed border-slate-300 hover:border-blue-400 text-blue-900 text-xs font-semibold px-3 py-2 rounded-xl transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-600 stroke-[2.5]" />
                  <span>Agregar curso</span>
                </button>
              </div>
            )}

            {/* Banner Informativo */}
            <div className="bg-[#f0f6ff] border border-blue-100 rounded-xl p-3 flex items-center justify-between gap-2.5 text-blue-900 mt-1">
              <div className="flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-900/80 leading-relaxed font-medium">
                  Al seleccionar un curso se muestra la lista de alumnos.
                </p>
              </div>
              <BookOpen className="w-6 h-6 text-blue-400 shrink-0 opacity-75" />
            </div>
          </div>

          {/* COLUMNA DERECHA: DETALLE DEL CURSO Y TABLA (SIN ALUMNOS PRECARGADOS) */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
            {!currentCourse ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#1b3187] flex items-center justify-center mb-4">
                  <BookOpen className="w-7 h-7 stroke-[1.5]" />
                </div>
                <h3 className="text-base font-bold text-slate-800">No hay cursos asignados</h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1.5 mb-5">
                  Haz clic en el botón 'Agregar curso' para dar de alta tu primer grupo escolar.
                </p>
                <button
                  onClick={handleAddCourse}
                  className="inline-flex items-center gap-1.5 bg-[#1b3187] hover:bg-[#15276e] text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Agregar curso</span>
                </button>
              </div>
            ) : (
              <>
                {/* Header del Curso Seleccionado */}
                <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Users className="w-6 h-6 stroke-[2]" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-800 leading-tight">
                        {currentCourse.name}
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {alumnos.length} alumnos • {currentCourse.shift}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Users className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">{alumnos.length}</div>
                        <div className="text-[10px] text-slate-400">Alumnos</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">{currentCourse.pending}</div>
                        <div className="text-[10px] text-slate-400">Pendientes</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl">
                      <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">{currentCourse.notes}</div>
                        <div className="text-[10px] text-slate-400">Notificaciones este mes</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pestañas */}
                <div className="px-6 border-b border-slate-100 flex items-center gap-6">
                  {['Lista de alumnos', 'Información del curso', 'Comunicaciones'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-3 text-xs font-bold relative transition cursor-pointer ${
                        activeTab === tab ? 'text-blue-900' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {tab}
                      {activeTab === tab && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-900 rounded-full" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Contenido sin alumnos iniciales */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  {alumnos.length === 0 ? (
                    <div className="py-14 text-center flex flex-col items-center justify-center">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mb-3">
                        <Users className="w-7 h-7 stroke-[1.5]" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-700">Sin alumnos cargados</h3>
                      <p className="text-xs text-slate-400 max-w-sm mt-1 mb-5">
                        No hay alumnos asignados a este curso todavía.
                      </p>
                      <button
                        onClick={() => {
                          const nombre = prompt('Nombre y Apellido del alumno:');
                          if (nombre) {
                            const dni = prompt('DNI:') || '45.000.000';
                            setAlumnos((prev) => [
                              ...prev,
                              { id: Date.now(), name: nombre, dni, status: 'Activo' },
                            ]);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 bg-[#1b3187] hover:bg-[#15276e] text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Cargar nuevo alumno</span>
                      </button>
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          <th className="pb-3 pl-2">Alumno</th>
                          <th className="pb-3">DNI</th>
                          <th className="pb-3 text-center">Estado</th>
                          <th className="pb-3 text-right pr-2">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {alumnos.map((a) => (
                          <tr key={a.id} className="hover:bg-slate-50 transition">
                            <td className="py-3 pl-2 text-xs font-bold text-slate-700">{a.name}</td>
                            <td className="py-3 text-xs text-slate-600">{a.dni}</td>
                            <td className="py-3 text-center">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                                {a.status}
                              </span>
                            </td>
                            <td className="py-3 text-right pr-2">
                              <button className="p-1.5 text-slate-400 hover:text-blue-600">
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {/* Paginación */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-slate-600">
                    <button className="px-2.5 py-1 rounded-md border border-slate-200 text-slate-500 font-medium text-[11px] flex items-center gap-1">
                      <ArrowLeft className="w-3 h-3" />
                      <span>Anterior</span>
                    </button>
                    {[1, 2, 3, 4].map((page) => (
                      <button
                        key={page}
                        className={`w-7 h-7 rounded-md font-semibold text-xs flex items-center justify-center ${
                          page === 1 ? 'bg-[#1b3187] text-white' : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button className="px-2.5 py-1 rounded-md border border-slate-200 text-slate-500 font-medium text-[11px] flex items-center gap-1">
                      <span>Siguiente</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}