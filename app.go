package main

import (
	"context"
	"encoding/base64"
	"fmt"
	"os"
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type App struct {
	ctx context.Context
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) SaveCanvas(dataURL string) error {
	parts := strings.Split(dataURL, ",")
	if len(parts) != 2 {
		return fmt.Errorf("invalid data URL")
	}

	data, err := base64.StdEncoding.DecodeString(parts[1])
	if err != nil {
		return fmt.Errorf("failed to decode base64: %w", err)
	}

	filePath, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		Title:          "Save Whiteboard",
		DefaultFilename: "whiteboard.png",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "PNG Images (*.png)",
				Pattern:     "*.png",
			},
		},
	})
	if err != nil {
		return fmt.Errorf("save dialog failed: %w", err)
	}

	if filePath == "" {
		return nil
	}

	return os.WriteFile(filePath, data, 0644)
}
