#!/bin/bash

# E-commerce Microservices Kubernetes Deployment Script
# This script deploys the complete e-commerce platform to Kubernetes

set -e

echo "🚀 Starting E-commerce Microservices Kubernetes Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    print_error "kubectl is not installed. Please install kubectl first."
    exit 1
fi

# Check if namespace exists, create if not
if ! kubectl get namespace ecommerce &> /dev/null; then
    print_status "Creating ecommerce namespace..."
    kubectl apply -f namespace.yaml
    print_success "Namespace created successfully"
else
    print_status "Namespace 'ecommerce' already exists"
fi

# Apply ConfigMaps and Secrets
print_status "Applying ConfigMaps and Secrets..."
kubectl apply -f configmaps/
kubectl apply -f secrets/
print_success "ConfigMaps and Secrets applied"

# Apply Persistent Volume Claims
print_status "Applying Persistent Volume Claims..."
kubectl apply -f persistent-volumes/
print_success "Persistent Volume Claims applied"

# Apply Infrastructure Deployments
print_status "Deploying Infrastructure Components..."
kubectl apply -f deployments/infrastructure-deployments.yaml
print_success "Infrastructure deployments applied"

# Wait for infrastructure to be ready
print_status "Waiting for infrastructure components to be ready..."
kubectl wait --for=condition=ready pod -l app=mongodb -n ecommerce --timeout=300s
kubectl wait --for=condition=ready pod -l app=redis -n ecommerce --timeout=300s
kubectl wait --for=condition=ready pod -l app=elasticsearch -n ecommerce --timeout=300s
print_success "Infrastructure components are ready"

# Apply Infrastructure Services
print_status "Applying Infrastructure Services..."
kubectl apply -f services/infrastructure-services.yaml
print_success "Infrastructure services applied"

# Apply Microservices Deployments
print_status "Deploying Microservices..."
kubectl apply -f deployments/auth-deployment.yaml
kubectl apply -f deployments/gateway-deployment.yaml
kubectl apply -f deployments/product-deployment.yaml
kubectl apply -f deployments/order-deployment.yaml
kubectl apply -f deployments/payment-deployment.yaml
kubectl apply -f deployments/search-deployment.yaml

# Apply remaining microservices deployments
for deployment in user notification review shipping; do
    if [ -f "deployments/${deployment}-deployment.yaml" ]; then
        kubectl apply -f deployments/${deployment}-deployment.yaml
    fi
done
print_success "Microservices deployments applied"

# Apply Microservices Services
print_status "Applying Microservices Services..."
kubectl apply -f services/microservices-services.yaml
print_success "Microservices services applied"

# Apply Monitoring
print_status "Deploying Monitoring Stack..."
kubectl apply -f monitoring/
print_success "Monitoring stack deployed"

# Apply Ingress (if available)
if [ -f "ingress/ingress.yaml" ]; then
    print_status "Applying Ingress Configuration..."
    kubectl apply -f ingress/
    print_success "Ingress configuration applied"
else
    print_warning "Ingress configuration not found, skipping..."
fi

# Wait for all deployments to be ready
print_status "Waiting for all deployments to be ready..."
kubectl wait --for=condition=available deployment --all -n ecommerce --timeout=600s
print_success "All deployments are ready"

# Display deployment status
print_status "Deployment Status:"
kubectl get pods -n ecommerce
kubectl get services -n ecommerce

# Display ingress information
if kubectl get ingress -n ecommerce &> /dev/null; then
    print_status "Ingress Information:"
    kubectl get ingress -n ecommerce
fi

# Display service endpoints
print_status "Service Endpoints:"
kubectl get endpoints -n ecommerce

print_success "🎉 E-commerce Microservices Platform deployed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Update your DNS to point to the LoadBalancer IP"
echo "2. Configure SSL certificates (if using cert-manager)"
echo "3. Access Grafana at: kubectl port-forward svc/grafana-service 3000:3000 -n ecommerce"
echo "4. Access Prometheus at: kubectl port-forward svc/prometheus-service 9090:9090 -n ecommerce"
echo "5. Monitor logs: kubectl logs -f deployment/gateway -n ecommerce"
echo ""
echo "🔧 Useful Commands:"
echo "- View all pods: kubectl get pods -n ecommerce"
echo "- View logs: kubectl logs -f <pod-name> -n ecommerce"
echo "- Scale deployment: kubectl scale deployment gateway --replicas=5 -n ecommerce"
echo "- Delete deployment: kubectl delete -f k8s-manifests/ -n ecommerce" 