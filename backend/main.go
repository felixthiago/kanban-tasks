package main

import (
	"log"
	"net/http"	
)

func cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		if r.Method == "OPTIONS" {
			return
		}
		next.ServeHTTP(w, r)
	})
}

func main() { 
	loadDB()

	mux := http.NewServeMux()

	mux.HandleFunc("GET /tasks", getTasks)
	mux.HandleFunc("POST /tasks", createTask)
	mux.HandleFunc("PUT /tasks/{id}", updateTask)
	mux.HandleFunc("DELETE /tasks/{id}", deleteTask)

	log.Println("API rodando na porta 8080.")
	http.ListenAndServe(":8080", cors(mux))
}