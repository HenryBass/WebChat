import { serve } from "https://deno.land/std@0.75.0/http/server.ts";
import { acceptWebSocket } from "https://deno.land/std@0.75.0/ws/mod.ts";
const server = serve(":8080");
console.log(`Chat server is running on 8080`);
let users = [];
for await (const req of server) {
    try {
        const { conn, r: bufReader, w: bufWriter, headers } = req;
        let socket = await acceptWebSocket({
            conn,
            bufReader,
            bufWriter,
            headers,
        });
        try {
            handleWs(socket);
        }
        catch (err) {
            console.error(`failed to receive frame: ${err}`);
            if (!socket.isClosed) {
                await socket.close(1000).catch(console.error);
            }
        }
    }
    catch (error) {
        try {
            let headers = new Headers();
            let data;
            if (req.url === "/" || req.url === "/index.html") {
                headers.set("Content-Type", "text/html");
                data = await Deno.readTextFile("index.html");
            }
            else if (req.url === "/style.css") {
                headers.set("Content-Type", "text/css");
                data = await Deno.readTextFile("style.css");
            }
            else if (req.url === "/frontend.js") {
                headers.set("Content-Type", "text/javascript");
                data = await Deno.readTextFile("frontend.js");
            }
            else if (req.url === "/modern.css") {
                headers.set("Content-Type", "text/css");
                data = await Deno.readTextFile("modern.css");
            }
            else if (req.url === "/retrored.css") {
                headers.set("Content-Type", "text/css");
                data = await Deno.readTextFile("retrored.css");
            }
            else if (req.url === "/retroblue.css") {
                headers.set("Content-Type", "text/css");
                data = await Deno.readTextFile("retroblue.css");
            }
            else {
                throw 404;
            }
            await req.respond({ status: 200, body: data, headers: headers });
        }
        catch {
            await req.respond({ status: 404 });
        }
    }
}
async function handleWs(socket) {
    for await (const event of socket) {
        function update() {
            users = users.filter(user => {
                try {
                    user.send(JSON.stringify({
                        type: "users",
                        data: {
                            users: users.length,
                            name: "undefined"
                        }
                    }));
                    return true;
                }
                catch {
                    return false;
                }
            });
            setTimeout(update, 1000);
        }
        update();
        if (typeof event === "string") {
            const parsedEvent = JSON.parse(event);
            if (parsedEvent.type === "open") {
                console.log("Connection established with a client.");
                users.push(socket);
                if (users.length > 1) {
                    var datetime = new Date();
                    var time = datetime.getHours() + ":" + datetime.getMinutes();
                    await socket.send(JSON.stringify({
                        type: "message",
                        data: {
                            name: "henrybot",
                            message: "Hey, welcome to henrychat! There are " + users.length + " users online rn &#129472;",
                            users: users.length,
                            channel: "any"
                        }
                    }));
                }
                else {
                    await socket.send(JSON.stringify({
                        type: "message",
                        data: {
                            name: "henrybot",
                            message: "Hey, welcome to henrychat! seems like you're the only person online. (for now)",
                            channel: "any"
                        }
                    }));
                }
            }
            else if (parsedEvent.type === "message") {
                console.dir(parsedEvent);
                users = users.filter(user => {
                    try {
                        user.send(JSON.stringify(parsedEvent));
                        return true;
                    }
                    catch {
                        return false;
                    }
                });
                console.log(`There ${users.length === 1 ? "is" : "are"} ${users.length} ${users.length === 1 ? "user" : "users"} online`);
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sNkNBQTZDLENBQUE7QUFDbkUsT0FBTyxFQUFFLGVBQWUsRUFBYSxNQUFNLHdDQUF3QyxDQUFBO0FBRW5GLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQTtBQUM3QixPQUFPLENBQUMsR0FBRyxDQUFDLGdDQUFnQyxDQUFDLENBQUE7QUFFN0MsSUFBSSxLQUFLLEdBQWdCLEVBQUUsQ0FBQTtBQUUzQixJQUFJLEtBQUssRUFBRSxNQUFNLEdBQUcsSUFBSSxNQUFNLEVBQUU7SUFDNUIsSUFBSTtRQUNBLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxHQUFHLEdBQUcsQ0FBQTtRQUN6RCxJQUFJLE1BQU0sR0FBRyxNQUFNLGVBQWUsQ0FBQztZQUMvQixJQUFJO1lBQ0osU0FBUztZQUNULFNBQVM7WUFDVCxPQUFPO1NBQ1YsQ0FBQyxDQUFBO1FBRUYsSUFBSTtZQUNBLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQTtTQUNuQjtRQUFDLE9BQU8sR0FBRyxFQUFFO1lBQ1YsT0FBTyxDQUFDLEtBQUssQ0FBQyw0QkFBNEIsR0FBRyxFQUFFLENBQUMsQ0FBQTtZQUVoRCxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRTtnQkFDbEIsTUFBTSxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUE7YUFDaEQ7U0FDSjtLQUVKO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDWixJQUFJO1lBQ0EsSUFBSSxPQUFPLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQTtZQUMzQixJQUFJLElBQUksQ0FBQTtZQUVSLElBQUksR0FBRyxDQUFD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