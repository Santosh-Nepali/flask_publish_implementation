import os

from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

# In-memory storage: resets whenever the server restarts.
tasks = []
next_id = 1


@app.route("/")
def index():
    return render_template("index.html")


@app.get("/api/tasks")
def list_tasks():
    return jsonify(tasks)


@app.post("/api/tasks")
def add_task():
    global next_id
    data = request.get_json(silent=True) or {}
    title = (data.get("title") or "").strip()
    if not title:
        return jsonify(error="Title is required"), 400

    task = {"id": next_id, "title": title[:120], "done": False}
    next_id += 1
    tasks.append(task)
    return jsonify(task), 201


@app.patch("/api/tasks/<int:task_id>")
def toggle_task(task_id):
    for task in tasks:
        if task["id"] == task_id:
            task["done"] = not task["done"]
            return jsonify(task)
    return jsonify(error="Task not found"), 404


@app.delete("/api/tasks/<int:task_id>")
def delete_task(task_id):
    tasks[:] = [t for t in tasks if t["id"] != task_id]
    return "", 204


if __name__ == "__main__":
    app.run(debug=True, port=int(os.environ.get("PORT", 5000)))
