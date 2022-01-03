let ws

function gettime() {
  var date = new Date();
  var hours = date.getHours();
  if (hours > 12) {
      if (date.getMinutes() < 10) {
        var time = (hours - 12) + ":" + ("0" + date.getMinutes())
      } else {
        var time = (hours - 12) + ":" + date.getMinutes()
      }
  } else {
    if (date.getMinutes() < 10) {
        var time = (hours) + ":" + ("0" + date.getMinutes())
      } else {
        var time = (hours) + ":" + date.getMinutes()
      }
  }
    return time
}

document.addEventListener("DOMContentLoaded", _ => {
    ws = new WebSocket(`wss://${window.location.host}`)

    const name = document.getElementById("name")
    const message = document.getElementById("message")

    ws.onopen = function () {
        ws.send(JSON.stringify({ type: "open", data: {} }))

    }

    ws.onclose = function (event) {
      document.getElementById("messageLog").insertAdjacentHTML(
        'beforeend',
        `<p class=msg><b>${gettime()} ~ henrybot</b>: The server is down. Reload in a bit to reconnect.</p>`
        )
    };

    ws.onmessage = function (event) {
        const msg = JSON.parse(event.data)
        addMessages(msg.data)
    };

    document.getElementById("send").addEventListener("click", sendMessage)
    message.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            sendMessage()
        }
    })

    function addMessages(message) {
        if (message.name != 'undefined') {

          document.getElementById("messageLog").insertAdjacentHTML(
              'beforeend',
              `<p class=msg><b>${gettime()} ~ ${message.name}</b>: ${message.message}</p>`
          )
          var elem = document.getElementById('messageLog');
          elem.scrollTop = elem.scrollHeight;
        }
        if (message.users != 'undefined') {
          document.getElementById("users").innerHTML = message.users + " Online"
        }
    }
    function sendMessage() {

        if (name.value.trim() === "") {
            alert("Enter a username!")
        } else if (message.value.trim() === "") {
            alert("Enter a message!")
        } else {
            ws.send(JSON.stringify({
                type: "message",
                data: {
                    name: name.value,
                    message: message.value,
                    users: "undefined"
                }
            }))
            message.value = ""
        }
    }
})

function update() {
  document.getElementById("time").innerHTML = "- " + gettime()
  setTimeout(update, 1000)
}

update()

// A random assortment of previous discord status

messages = ["amonus in rel life sus", "aaaaaaaaaaaaaaa", "send help", "wait what", "when the is sus", "silksoon"]

motd = messages[Math.floor(Math.random() * messages.length)]
document.getElementById("msg").innerText = motd

function changetheme() {
  var r = document.querySelector(':root');
  r.style.setProperty('--color', 'red');
  console.log("Theme Changed!")
}