const socket = io()

// socket.on('countUpdated',(count)=>{
//     console.log("count updated!",count)
// })



const variableform = document.querySelector('#msg') 
const forminput = variableform.querySelector('input')
const formbutton = variableform.querySelector('button')
const locbutton = document.querySelector('#loc')
const $messages = document.querySelector('#messages')

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix:true})
const autoscroll = ()=>{
    const newmsg = $messages.lastElementChild

    const newmsgStyles = getComputedStyle(newmsg)
    const newmsgmargin = parseInt(newmsgStyles.marginBottom)
    const newmsgHeight = newmsg.offsetHeight + newmsgmargin

    const visibleheight = $messages.offsetHeight

    const containerHeight = $messages.scrollHeight

    const scrollOffset = $messages.scrollTop + visibleheight

    if(containerHeight-newmsgHeight <= scrollOffset+1) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('welcomeMsg',(message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username : message.username,
        message : message.text,
        createdAt : moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMsg',(url)=>{
    console.log(url)
    const html = Mustache.render(locationTemplate,{
        url
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

variableform.addEventListener('submit', (e)=>{
    e.preventDefault()
    // const message = e.target.elements.message.value
    const message = e.target.elements.message.value
    socket.emit('sendmsg',message, (message)=>{
        console.log("Message Delivered",message)
        forminput.value = ''
        forminput.focus()

    })
})
// document.querySelector('#increment').addEventListener('click', ()=>{
//     console.log('clicked!!!')
//     socket.emit('increase')
// })
locbutton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geolocation not supported!')
    }
    locbutton.setAttribute('disabled','disabled')


    navigator.geolocation.getCurrentPosition((position)=>{
        console.log(position)
        socket.emit('sendlocation',{
            latitude : position.coords.latitude,
            longitude : position.coords.longitude
        },()=>{
            console.log("Location shared")
            locbutton.removeAttribute('disabled')
        })
    
        
    })
})

socket.on('roomData',({room,users})=>{
    console.log(room)
    console.log(users)
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

socket.emit('join', {username,room}, (error)=>{
    if (error) {
        alert(error)
        location.href = '/'
    }
})
