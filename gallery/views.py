from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.models import User

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    if not username or not password:
        return Response(
            {'error': 'Käyttäjänimi ja salasana vaaditaan'},
            status=status.HTTP_400_BAD_REQUEST
        )
    if User.objects.filter(username=username).exists():
        return Response(
            {'error': 'Käyttäjänimi on jo käytössä'},
            status=status.HTTP_400_BAD_REQUEST
        )
    user = User.objects.create_user(username=username, password=password)
    return Response(
        {'message': 'Käyttäjä luotu onnistuneesti'},
        status=status.HTTP_201_CREATED
    )

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        login(request, user)
        return Response({'message': 'Kirjautuminen onnistui'})
    return Response(
        {'error': 'Väärä käyttäjänimi tai salasana'},
        status=status.HTTP_401_UNAUTHORIZED
    )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({'message': 'Uloskirjautuminen onnistui'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def home_view(request):
    return Response({'message': f'Hei {request.user.username}!'})