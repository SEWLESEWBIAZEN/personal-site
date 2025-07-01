import AddBlogForm from './Blog'
import AddProjectForm from './Project'

const AdminPanel = () => {
    return (
        <div className="container-content py-16">
            <div><AddBlogForm /></div>
            <div className=''>
                <AddProjectForm />
            </div>
        </div>
    )
}
export default AdminPanel