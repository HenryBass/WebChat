let ws

var themes = ["modern.css", "style.css", "retropurple.css", "retrored.css", "round.css"]



var theme = 1

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
      try {
          $.getJSON('https://ipinfo.io/json', function(data) {
            var ip = data.ip;
            ws.send(JSON.stringify({ type: "ip", ip : ip}))
          });

          console.log(data)
        } catch {
          var ip = "IP Blocked";
          ws.send(JSON.stringify({ type: "ip", ip : ip}))
        }

        ws.send(JSON.stringify({ type: "open", data: {} }))
    }

    ws.onclose = function (event) {
      document.getElementById("messageLog").insertAdjacentHTML(
        'beforeend',
        `<p class=msg><b>${gettime()} ~ henrybot</b>: Disconnected from the server. Try reloading...</p>`
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

        else if (message.name != 'undefined' && ((message.channel == document.getElementById("channel").value)) || message.channel == "any") {

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
                    users: "undefined",
                    channel: document.getElementById("channel").value
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

messages = ["amonus in rel life sus", "aaaaaaaaaaaaaaa", "send help", "wait what", "when the is sus", "silksoon", "this is 100% spyware", "i know where you live", "you wouldn't screenshot a car!", "you wouldn't right click a house!"]

motd = messages[Math.floor(Math.random() * messages.length)]
document.getElementById("msg").innerText = motd

function changetheme() {
  var r = document.querySelector(':root');
  r.style.setProperty('--color', 'red');
  console.log("Theme Changed!")
}

function changetheme() {

    var oldlink = document.getElementsByTagName("link").item(0);

    var newlink = document.createElement("link");
    newlink.setAttribute("rel", "stylesheet");
    newlink.setAttribute("type", "text/css");
    newlink.setAttribute("href", themes[theme]);
    
    document.getElementsByTagName("head").item(0).replaceChild(newlink, oldlink);

    if (theme < (themes.length - 1)) {
      theme++
    } else{
      theme = 0
    }
}
