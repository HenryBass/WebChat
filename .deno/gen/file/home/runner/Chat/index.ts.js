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
                            message: "Hey, welcome to henrychat! There are " + users.length + " users online rn",
                            users: users.length
                        }
                    }));
                }
                else {
                    await socket.send(JSON.stringify({
                        type: "message",
                        data: {
                            name: "henrybot",
                            message: "Hey, welcome to henrychat! seems like you're the only person online. (for now)"
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