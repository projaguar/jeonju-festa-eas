import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Animated, Platform, StyleSheet } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

const SPLASH_VIDEOS = [
  require('@/assets/splash/splash-1.mp4'),
  require('@/assets/splash/splash-1-object.mp4'),
  require('@/assets/splash/splash-2.mp4'),
  require('@/assets/splash/splash-2-object.mp4'),
  require('@/assets/splash/splash-3.mp4'),
  require('@/assets/splash/splash-3-object.mp4'),
];

interface AnimatedSplashProps {
  onComplete: () => void;
}

export function AnimatedSplash({ onComplete }: AnimatedSplashProps) {
  const fadeAnim = useMemo(() => new Animated.Value(1), []);
  const wasPlaying = useRef(false);

  const selectedVideo = useMemo(
    () => SPLASH_VIDEOS[Math.floor(Math.random() * SPLASH_VIDEOS.length)],
    [],
  );

  const player = useVideoPlayer(selectedVideo, (p) => {
    p.loop = false;
    p.muted = true;
    p.play();
  });

  const triggerFadeOut = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => onComplete());
  }, [fadeAnim, onComplete]);

  useEffect(() => {
    const subscription = player.addListener('playingChange', ({ isPlaying }) => {
      if (isPlaying) wasPlaying.current = true;
      if (wasPlaying.current && !isPlaying) {
        triggerFadeOut();
      }
    });
    return () => subscription.remove();
  }, [player, triggerFadeOut]);

  return (
    <Animated.View
      style={[styles.container, { opacity: fadeAnim }]}
      pointerEvents="none"
    >
      <VideoView
        player={player}
        style={styles.video}
        contentFit="cover"
        nativeControls={false}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    zIndex: 999,
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
});
