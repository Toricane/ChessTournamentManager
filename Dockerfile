# Use the official httpd image
FROM httpd:latest

# Copy contents from the src directory to the Apache web server's htdocs directory
COPY src/ /usr/local/apache2/htdocs/