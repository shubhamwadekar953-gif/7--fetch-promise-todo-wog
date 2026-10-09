const cl = console.log;

const todoForm = document.getElementById('todoForm')
const userId = document.getElementById('userId')
const addTodo = document.getElementById('addTodo')
const submitBtn = document.getElementById('submitBtn')
const updateBtn = document.getElementById('updateBtn')
const todoList = document.getElementById('todoList')
const spinner = document.getElementById('spinner')

const BASE_URL ='https://student-crud-26d0f-default-rtdb.firebaseio.com/tod%20crud%20by%20using%20firebase%20web/fetch%20promise%20todo%20crud%20wog'
const TODO_URL = `${BASE_URL}todos.json`

function snackbar(msg, icon){ 
    Swal.fire({ title: msg,
     icon: icon,
      timer: 2000 }) 
    }


function showSpinner(){ spinner.classList.remove('d-none') }
function hideSpinner(){ spinner.classList.add('d-none') }

const state = { todoArr: [], editId: null }


function onCreateTodo(arr){
    let result = ``;
    arr.forEach(todo=>{
        result += `
            <tr id="${todo.id}">
                <td>${todo.userId}</td>
                <td>${todo.todoName}</td>
                <td><button onclick="editTodo(this)" class="btn btn-success btn-sm">Edit</button></td>
                <td><button onclick="deleteTodo(this)" class="btn btn-danger btn-sm">Remove</button></td>
            </tr>`
    })
    todoList.innerHTML = result;
}

function fetchTodo(){
    showSpinner()
    fetch(TODO_URL,{ method:"GET", headers:{ "Content-type":"application/json" }})
   .then(res=>{ if(!res.ok) throw new Error(); return res.json() })
   .then(data=>{
        if(data){
            for(const key in data){ data[key].id = key; state.todoArr.unshift(data[key]) }
            onCreateTodo(state.todoArr)
        }
    })
   .catch(err=>cl(err))
   .finally(()=>hideSpinner())
}
fetchTodo()

function onTodoAdd(eve){
    eve.preventDefault()
    let todoObj = { userId: userId.value, todoName: addTodo.value }
    if(!todoObj.userId ||!todoObj.todoName) return snackbar('Fill todos form poperly','warning')

    showSpinner()
    fetch(TODO_URL,{ method:"POST", body:JSON.stringify(todoObj), headers:{ "Content-type":"application/json" }})
   .then(res=>res.json())
   .then(data=>{
        todoObj.id = data.name
        state.todoArr.unshift(todoObj)

        let tr = document.createElement('tr')
        tr.id = todoObj.id
        tr.innerHTML = `
                <td>${todoObj.userId}</td>
                <td>${todoObj.todoName}</td>
                <td><button onclick="editTodo(this)" class="btn btn-success btn-sm">Edit</button></td>
                <td><button onclick="deleteTodo(this)" class="btn btn-danger btn-sm">Remove</button></td>
            `
        todoList.prepend(tr)
        todoForm.reset()
        snackbar('Todo added','success')
    })
   .finally(()=>hideSpinner())
}

function deleteTodo(ele){
    let REMOVE_ID = ele.closest('tr').id
    let REMOVE_URL = `${BASE_URL}todos/${REMOVE_ID}.json`
    Swal.fire({ title:"Are you sure you want to remove this todo?", icon:"warning", showCancelButton:true, confirmButtonText:"Yes, delete it!" })
   .then((result)=>{
        if(result.isConfirmed){
            showSpinner()
            fetch(REMOVE_URL,{ method:"DELETE" })
           .then(()=>{ state.todoArr = state.todoArr.filter(t=>t.id!== REMOVE_ID); ele.closest('tr').remove(); snackbar('Deleted','success') })
           .finally(()=>hideSpinner())
        }
    })
}

function editTodo(ele){
    let editId = ele.closest('tr').id
    state.editId = editId
    let EDIT_URL = `${BASE_URL}todos/${editId}.json`
    showSpinner()
    fetch(EDIT_URL)
   .then(res=>res.json())
   .then(data=>{
        userId.value = data.userId
        addTodo.value = data.todoName
        submitBtn.classList.add('d-none')
        updateBtn.classList.remove('d-none')
    })
   .finally(()=>hideSpinner())
}

function onUpdateTodo(){
    let update_Id = state.editId
    let UPDATE_URL = `${BASE_URL}todos/${update_Id}.json`
    let updateObj = { userId: userId.value, todoName: addTodo.value, id: update_Id }

    showSpinner()
    fetch(UPDATE_URL,{ method:"PATCH", body:JSON.stringify(updateObj), headers:{ "Content-type":"application/json" }})
   .then(()=>{
        let getIndex = state.todoArr.findIndex(t=>t.id === update_Id)
        state.todoArr[getIndex] = updateObj
        let tr = document.getElementById(update_Id)

        tr.innerHTML = `
            <td>${updateObj.userId}</td>
            <td>${updateObj.todoName}</td>
            <td><button onclick="editTodo(this)" class="btn btn-success btn-sm">Edit</button></td>
            <td><button onclick="deleteTodo(this)" class="btn btn-danger btn-sm">Remove</button></td>
        `
        todoForm.reset()
        submitBtn.classList.remove('d-none')
        updateBtn.classList.add('d-none')
        snackbar('Updated','success')
    })
   .finally(()=>hideSpinner())
}

todoForm.addEventListener('submit', onTodoAdd)
updateBtn.addEventListener('click', onUpdateTodo)