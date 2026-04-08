from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.models import User
from .models import Album, Photo
from .serializers import AlbumSerializer, PhotoSerializer
from PIL import Image
import os

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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_photo(request):
    image_file = request.FILES.get('image')
    title = request.data.get('title', 'Nimetön kuva')
    description = request.data.get('description', '')
    album_id = request.data.get('album')

    if not image_file:
        return Response(
            {'error': 'Kuva puuttuu'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Tarkista tiedostomuoto
    allowed_formats = ['image/jpeg', 'image/png', 'image/gif']
    if image_file.content_type not in allowed_formats:
        return Response(
            {'error': 'Sallitut kuvamuodot ovat JPEG, PNG ja GIF'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Hae albumi
    try:
        album = Album.objects.get(id=album_id, owner=request.user)
    except Album.DoesNotExist:
        return Response(
            {'error': 'Albumia ei löydy'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Tallenna kuva
    photo = Photo.objects.create(
        album=album,
        owner=request.user,
        title=title,
        description=description,
        image=image_file
    )

    # Luo thumbnail Pillowilla
    img = Image.open(photo.image.path)
    img.thumbnail((300, 300))
    thumb_dir = os.path.join('media', 'thumbnails')
    os.makedirs(thumb_dir, exist_ok=True)
    thumb_filename = f'thumb_{os.path.basename(photo.image.name)}'
    thumb_path = os.path.join(thumb_dir, thumb_filename)
    img.save(thumb_path)
    photo.thumbnail = f'thumbnails/{thumb_filename}'
    photo.save()

    serializer = PhotoSerializer(photo)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_photos(request):
    photos = Photo.objects.filter(owner=request.user)
    serializer = PhotoSerializer(photos, many=True)
    return Response(serializer.data)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_photo(request, photo_id):
    try:
        photo = Photo.objects.get(id=photo_id, owner=request.user)
    except Photo.DoesNotExist:
        return Response(
            {'error': 'Kuvaa ei löydy'},
            status=status.HTTP_404_NOT_FOUND
        )
    photo.delete()
    return Response({'message': 'Kuva poistettu'})

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def albums(request):
    if request.method == 'GET':
        albums = Album.objects.filter(owner=request.user)
        serializer = AlbumSerializer(albums, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        name = request.data.get('name')
        description = request.data.get('description', '')
        if not name:
            return Response(
                {'error': 'Albumin nimi puuttuu'},
                status=status.HTTP_400_BAD_REQUEST
            )
        album = Album.objects.create(
            owner=request.user,
            name=name,
            description=description
        )
        serializer = AlbumSerializer(album)
        return Response(serializer.data, status=status.HTTP_201_CREATED)