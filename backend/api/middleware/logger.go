package middleware

import (
	"github.com/gin-gonic/gin"
	"log"
)

func ErrorLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		if len(c.Errors) > 0 {
			for _, e := range c.Errors {
				log.Printf("[API ERROR] Path: %s | Error: %v", c.Request.URL.Path, e.Err)
			}
		}
	}
}
