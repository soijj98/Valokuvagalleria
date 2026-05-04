from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import JsonResponse
from .models import Album, Photo
from .serializers import AlbumSerializer, PhotoSerializer
from sorl.thumbnail import get_thumbnail

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

#jos kirjautuminen tökkii
#@csrf_exempt 
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


@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({'message': 'Uloskirjautuminen onnistui'})

@api_view(['GET'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
@csrf_exempt 
def home_view(request):
    if request.user.is_authenticated:
        return JsonResponse({
            'message': f'Hei {request.user.username}!'
        })
    else:
        return JsonResponse({
            'message': ''
        })



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

    allowed_formats = ['image/jpeg', 'image/png', 'image/gif']
    if image_file.content_type not in allowed_formats:
        return Response(
            {'error': 'Sallitut kuvamuodot ovat JPEG, PNG ja GIF'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        album = Album.objects.get(id=album_id, owner=request.user)
    except Album.DoesNotExist:
        return Response(
            {'error': 'Albumia ei löydy'},
            status=status.HTTP_404_NOT_FOUND
        )

    photo = Photo.objects.create(
        album=album,
        owner=request.user,
        title=title,
        description=description,
        image=image_file
    )

    tags = request.data.getlist('tags')
    if not tags:
        tags_string = request.data.get('tags', '')
        if tags_string:
            tags = [t.strip() for t in tags_string.split(',') if t.strip()]

    if tags:
        photo.tags.add(*tags)

    serializer = PhotoSerializer(photo, context={'request': request})
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_photos(request):
    photos = Photo.objects.filter(owner=request.user)
    serializer = PhotoSerializer(photos, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_photo(request, photo_id):
    try:
        photo = Photo.objects.get(id=photo_id, owner=request.user)
    except Photo.DoesNotExist:
        return Response(
            {'error': 'Kuvaa ei löydy tai sinulla ei ole oikeus poistaa sitä.'},
            status=status.HTTP_404_NOT_FOUND
        )
    photo.delete()
    return Response({'message': 'Kuva poistettu'})

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_photo(request, photo_id):
    try:
        photo = Photo.objects.get(id=photo_id, owner=request.user)
    except Photo.DoesNotExist:
        return Response(
            {'error': 'Kuvaa ei löydy tai sinulla ei ole oikeutta muokata sitä'}, 
            status=status.HTTP_404_NOT_FOUND
        )

    # partial=True sallii sen, että päivitämme vain osan kentistä
    serializer = PhotoSerializer(photo, data=request.data, partial=True, context={'request': request})
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
        
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated]) #isauthenticated????
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
    
@api_view(['DELETE', 'PATCH'])
@permission_classes([IsAuthenticated])
def album_detail(request, album_id):
    try: 
        album = Album.objects.get(id=album_id, owner=request.user)
    except Album.DoesNotExist:
        return Response(
            {'error': 'Albumia ei löydy tai sinulla ei ole oikeus muokata sitä.'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'DELETE':
        album.delete()
        return Response(
            {'message': 'Albumi poistettu'}, status=status.HTTP_204_NO_CONTENT
       )

    elif request.method == 'PATCH':
        serializer = AlbumSerializer(album, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_album(request, album_id):
    try:
        # Varmistetaan, että albumi on olemassa ja se kuuluu pyynnön tekijälle
        album = Album.objects.get(id=album_id, owner=request.user)
    except Album.DoesNotExist:
        return Response(
            {'error': 'Albumia ei löydy tai sinulla ei ole oikeutta poistaa sitä'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Poistetaan albumi (ja siihen liittyvät kuvat, jos tietokannassa on CASCADE-asetus)
    album.delete()
    return Response({'message': 'Albumi poistettu'}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny]) 
def public_photo_feed(request):
    # Haetaan kaikki kuvat tietokannasta, järjestettynä uusimmasta vanhimpaan
    # (Olettaen, että mallissa on esim. created_at -kenttä. Jos ei ole, poista .order_by(...))
    photos = Photo.objects.all().order_by('-id') 
    serializer = PhotoSerializer(photos, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_by_tag(request):
    tag = request.query_params.get('tag')
    photos = Photo.objects.filter(tags__name__in=[tag], owner=request.user)
    serializer = PhotoSerializer(photos, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    return Response({"status": "Backend pyörii normaalisti!", "version": "1.0"})

def check_auth_status(request):
    if request.user.is_authenticated:
        return JsonResponse({'is_logged_in': True})
    else:
        return JsonResponse({'is_logged_in': False})