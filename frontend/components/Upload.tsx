export default function Upload(){
  return (
    <form className="p-6">
      <input type="file" accept="video/*"/>
      <select>
        <option>Short Form</option>
        <option>Long Form</option>
      </select>
      <button>Upload</button>
    </form>
  )
}
