package main

import (
	"fmt"
	"os"

	"gitp/app"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Usage: gitp <branch-name>")
		fmt.Println("Example: gitp main")
		os.Exit(1)
	}

	branchName := os.Args[1]

	// Change to current directory (assume git repo)
	if err := os.Chdir("."); err != nil {
		fmt.Printf("Error changing to current directory: %v\n", err)
		os.Exit(1)
	}

	// Create and run the application
	app := app.NewApp(branchName)
	if err := app.Run(); err != nil {
		fmt.Printf("Error running application: %v\n", err)
		os.Exit(1)
	}
}
