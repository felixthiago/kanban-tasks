package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"sync"
)

var (
	tasks []Task
	mu    sync.Mutex
	db    = "tasks.json"
)


func loadDB() {
	data, err := os.ReadFile(db)
	if err == nil {
		json.Unmarshal(data, &tasks)
	}
}

func saveDB() {
	data, _ := json.MarshalIndent(tasks, "", "  ")
	os.WriteFile(db, data, 0644)
}

// GET -> /tasks/
func getTasks(w http.ResponseWriter, r *http.Request){ 
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tasks)
}


// POST -> /tasks/
func createTask(w http.ResponseWriter, r *http.Request) {
	var t Task
	json.NewDecoder(r.Body).Decode(&t)

	if t.Title == "" { 
		http.Error(w, "type a title for the task!", http.StatusBadRequest)
		return
	}

	mu.Lock()

	defer mu.Unlock()

	maxID := 0

	for _, task := range tasks {
		if task.ID > maxID {
			maxID = task.ID
		}
	}
	t.ID = maxID + 1

	t.Status = "TODO"

	tasks = append(tasks, t)
	saveDB()
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(t)
}

// UPDATE -> /tasks/[id]
func updateTask(w http.ResponseWriter, r *http.Request) { 
	uID := r.PathValue("id")

	var t Task

	json.NewDecoder(r.Body).Decode(&t)

	mu.Lock()

	defer mu.Unlock()

	for i := range tasks {
		if fmt.Sprintf("%d", tasks[i].ID) == uID {
			tasks[i].Status = t.Status
			saveDB()

			json.NewEncoder(w).Encode(tasks[i])
			return
		}
	}
	http.Error(w, "task not found", http.StatusNotFound)
}


// DELETE -> /tasks/[id]

func deleteTask(w http.ResponseWriter, r *http.Request) {
	uID := r.PathValue("id")

	mu.Lock()
	defer mu.Unlock()

	for i := range tasks {
		if fmt.Sprintf("%d", tasks[i].ID) == uID {
			tasks = append(tasks[:i], tasks[i+1:]...)
			saveDB()
			w.WriteHeader(http.StatusNoContent)
			return
		}
	}
}