from rest_framework import serializers
from .models import Album, Photo

class AlbumSerializer(serializers.ModelSerializer):
    class Meta:
        model = Album
        fields = ['id', 'name', 'description', 'created_at']

class PhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Photo
        fields = ['id', 'album', 'title', 'description', 'image', 'thumbnail', 'tags', 'uploaded_at']