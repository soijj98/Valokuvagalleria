from rest_framework import serializers
from .models import Album, Photo
from taggit.serializers import TagListSerializerField, TaggitSerializer
from sorl.thumbnail import get_thumbnail

class AlbumSerializer(serializers.ModelSerializer):
    class Meta:
        model = Album
        fields = ['id', 'owner', 'name', 'description', 'created_at']

class PhotoSerializer(serializers.ModelSerializer):
    tags = TagListSerializerField()
    thumbnail = serializers.SerializerMethodField()
    
    class Meta:
        model = Photo
        fields = ['id', 'album', 'title', 'description', 'image', 'thumbnail', 'tags', 'uploaded_at']

    def get_thumbnail(self, obj):
        if obj.image:
            try:
            # luodaan 300x300 kokoinen pikkukuva
                thumb = self.get_thumbnail(obj.image, '300x300', crop='center', quality=99)
            
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(thumb.url)
                return thumb.url
            except Exception as e:
                return None
        return None