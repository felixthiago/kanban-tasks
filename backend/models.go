package main

type Task struct {
	ID          int `json:"ID"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Status      string `json:"status"`
}
