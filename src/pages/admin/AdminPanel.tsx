import { Plus } from 'lucide-react'
import AddProjectForm from './Project'
import { Link } from 'react-router-dom'

const AdminPanel = () => {
    return (
        <div className="container-content py-16">
            <Link to="/blogs/admin/new"><button
                className='flex flex-row px-4 py-2 rounded text-nowrap mb-4 md:mb-0 
                    cursor-pointer items-center justify-end text-slate-400 hover:bg-slate-50 hover:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-800'
            >
                <Plus />
                <h2 className='text-[14px]'>Add Blog</h2>
            </button>
            </Link>
            <div className=''>
                <AddProjectForm />
            </div>
        </div>
    )
}
export default AdminPanel