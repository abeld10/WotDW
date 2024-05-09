// Initialize a variable for the socket connection
var socket;
// Wait for the DOM to be fully loaded
    $(document).ready(function(){
        
        // Establish a WebSocket connection with the server
        // change to https when added
        socket = io.connect('https://' + document.domain + ':' + location.port + '/chat');
        socket.on('connect', function() {
            socket.emit('joined', {}); // Emit a 'joined' event to the server
        });
        
        // Listen for 'status' events sent by the server
        socket.on('status', function(data) {     
            let tag  = document.createElement("p");
            let text = document.createTextNode(data.msg);
            let element = document.getElementById("chat-window");
            tag.appendChild(text);
            tag.style.cssText = data.style;
            element.appendChild(tag);
            $('#chat-window').scrollTop($('#chat-window')[0].scrollHeight);

        });        

        // Listen for 'receive_message' events sent by the server
        socket.on('receive_message', function(data){
            let tag  = document.createElement("p");
            let text = document.createTextNode(data.msg);
            let element = document.getElementById("chat-window");

            if (data.isOwner) {
                tag.classList.add('owner-message');
            }

            tag.appendChild(text);
            element.appendChild(tag)
            $('#chat-window').scrollTop($('#chat-window')[0].scrollHeight);
        });


    });


function escapeHTML(text){
    var element = document.createElement('div');
    element.innerText = text;
    return element.innerHTML;
}


// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    const sendMessage = () => {
        const messageInput = document.getElementById('message-input');
        var message = messageInput.value.trim();
        message = escapeHTML(message);
        if (message) {
            socket.emit('send_message', { msg: message });
            messageInput.value = '';
        }
    };
    // Add click event listener for the send button
    document.getElementById('send-button').addEventListener('click', sendMessage);

    // Add keypress event listener for the message input to send message on 'Enter'
    document.getElementById('message-input').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Add click event listener for the leave button
    document.getElementById('leave-button').addEventListener('click', function(){
        socket.emit('left',{});
        window.location.href = '/';
    });

});


