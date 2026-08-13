import { useState, useEffect } from 'react'
import { ListTodo, Rocket, CheckCircle, SquareKanban, ArrowLeft, ArrowRight, Trash2 } from 'lucide-react'

const API_URL = 'http://localhost:8080/tasks'

function App() {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState({ title: '', description: '' })

  const fetchTasks = async () => {
    try {
      const res = await fetch(API_URL)
      const data = await res.json()
      setTasks(data || [])
    } catch (err) {
      console.error("Erro ao buscar tarefas", err)
    }
  }

  const [logs, setLogs] = useState([])

  const addLog = (message, type = 'info') => {
    const id = Date.now()
    setLogs(prev => [...prev, { id, message, type }])
    
    setTimeout(() => {
      setLogs(prev => prev.filter(log => log.id !== id))
    }, 3000)
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newTask.title.trim()) return

    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      })
      addLog(`Tarefa "${newTask.title}" criada com sucesso!`, 'success')
      setNewTask({ title: '', description: '' })
      fetchTasks()
    } catch (err) {
      console.error("Erro ao criar tarefa", err)
    }
  }

  const handleMove = async (id, newStatus, taskTitle) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      const statusName = newStatus === 'TODO' ? 'A Fazer' : newStatus === 'DOING' ? 'Em Progresso' : 'Concluída'
      addLog(`"${taskTitle}" movida para ${statusName}!`, 'info')
      
      fetchTasks()
    } catch (err) {
      console.error("Erro ao mover tarefa", err)
    }
  }

  const handleDelete = async (id, taskTitle) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      addLog(`Tarefa "${taskTitle}" foi excluída.`, 'error')
      fetchTasks()
    } catch (err) {
      console.error("Erro ao deletar tarefa", err)
    }
  }

  const columns = {
    TODO: { title: "A Fazer", items: tasks.filter(t => t.status === 'TODO'), icon: <ListTodo size = {20} strokeWidth = {2} /> },
    DOING: { title: "Em Progresso", items: tasks.filter(t => t.status === 'DOING'), icon: <Rocket size = {20} strokeWidth = {2} /> },
    DONE: { title: "Concluídas", items: tasks.filter(t => t.status === 'DONE'), icon: <CheckCircle size = {20} strokeWidth = {2} /> }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 font-sans text-gray-900 min-h-screen">
      
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-black rounded-sm transform -rotate-6 flex items-center justify-center shadow-[4px_4px_0_#000]">
            <SquareKanban size={28} strokeWidth={2.5} className="text-white transform rotate-6" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Mini Kanban</h1>
        </div>
        
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-4 max-w-3xl">
          <input
            className="flex-1 border-2 border-black rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-4 focus:ring-black/5 shadow-[4px_4px_0_#000] placeholder-gray-500 font-medium transition-shadow"
            placeholder="O que fazer?"
            value={newTask.title}
            onChange={e => setNewTask({ ...newTask, title: e.target.value })}
          />
          <input
            className="flex-1 border-2 border-black rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-4 focus:ring-black/5 shadow-[4px_4px_0_#000] placeholder-gray-500 font-medium transition-shadow text-sm"
            placeholder="Descrição (opcional)"
            value={newTask.description}
            onChange={e => setNewTask({ ...newTask, description: e.target.value })}
          />
          <button 
            type="submit"
            className="bg-gray-700 text-white border-2 border-black rounded-lg px-8 py-3 font-bold shadow-[4px_4px_0_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0_#000] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all"
          >
            Adicionar
          </button>
        </form>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {Object.entries(columns).map(([status, col]) => (
          <div key={status} className="flex flex-col">
            
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span>{col.emoji}</span> {col.title}
              <span className="bg-black text-white text-xs px-2 py-1 rounded-full ml-auto shadow-[2px_2px_0_#000]">
                {col.items.length}
              </span>
            </h2>

            <div className="flex flex-col gap-4">
              {col.items.map(task => (
                <div key={task.id} className="bg-white border-2 border-black rounded-xl p-5 shadow-[4px_4px_0_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0_#000] transition-all flex flex-col group">
                  <h3 className="text-lg font-bold leading-tight mb-2 text-black">{task.title}</h3>
                  {task.description && (
                    <p className="text-sm text-gray-700 font-medium mb-4">{task.description}</p>
                  )}
                  

                  <div className="flex gap-2 mt-auto pt-2">
                    {status !== 'TODO' && (
                      <button 
                        onClick={() => handleMove(task.id, status === 'DONE' ? 'DOING' : 'TODO', task.title)}
                        className="cursor-pointer flex-1 flex justify-center items-center gap-1 bg-[#F4F5F0] border-2 border-black rounded-md py-1.5 text-xs font-bold hover:bg-gray-200 transition-colors shadow-[2px_2px_0_#000] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none"
                        title="Mover para trás"
                      >
                        <ArrowLeft size={14} strokeWidth={3} />
                      </button>
                    )}
                    
                    <button 
                      onClick={() => handleDelete(task.id, task.title)}
                      className="cursor-pointer flex-1 flex justify-center items-center gap-1 bg-[#F54E41] text-white border-2 border-black rounded-md py-1.5 text-xs font-bold hover:bg-[#d94438] transition-colors shadow-[2px_2px_0_#000] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none"
                      title="Excluir"
                    >
                      <Trash2 size={14} strokeWidth={3} />
                    </button>

                    {status !== 'DONE' && (
                      <button 
                        onClick={() => handleMove(task.id, status === 'TODO' ? 'DOING' : 'DONE', task.title)}
                        className="cursor-pointer flex-1 flex justify-center items-center gap-1 bg-[#F4F5F0] border-2 border-black rounded-md py-1.5 text-xs font-bold hover:bg-gray-200 transition-colors shadow-[2px_2px_0_#000] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none"
                        title="Avançar"
                      >
                        <ArrowRight size={14} strokeWidth={3} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {col.items.length === 0 && (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-white/50">
                  <p className="text-sm text-gray-500 font-bold">Nenhuma tarefa aqui.</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50 pointer-events-none">
        {logs.map(log => {
          const bgColor = log.type === 'error' ? 'bg-[#F54E41] text-white' : log.type === 'success' ? 'bg-[#219653] text-white' : 'bg-white text-black'
          
          return (
            <div 
              key={log.id} 
              className={`animate-slide-up px-6 py-4 border-2 border-black rounded-lg shadow-[4px_4px_0_#000] flex items-center gap-3 pointer-events-auto ${bgColor}`}
            >
              {log.type === 'success' && <CheckCircle size = {20} strokeWidth = {3} />}
              {log.type === 'error' && <Trash2 size = {20} strokeWidth = {3} />}
              {log.type === 'info' && <Rocket size = {20} strokeWidth = {3} />}
              <span className="font-bold text-sm">{log.message}</span>
            </div>
          )
        })}
      </div>
      
    </div>
  )
}

export default App