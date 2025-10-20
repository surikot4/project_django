from django.shortcuts import render, redirect
from django.http import HttpResponse

def home(request):
    return render(request, 'home.html')

def portfolio(request):
    return render(request, 'portfolio.html')