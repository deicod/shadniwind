import { StyleSheet, ScrollView, Text } from 'react-native';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

export default function TabOneScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card>
        <CardHeader>
          <CardTitle>Acceptance Testing</CardTitle>
          <CardDescription>Wave 13 Verification</CardDescription>
        </CardHeader>
        <CardContent>
           <Button onPress={() => console.log('Pressed')}>
             Test Button
           </Button>
        </CardContent>
        <CardFooter>
          <Text>Footer Content</Text>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
             <CardTitle>Tokens Verification</CardTitle>
        </CardHeader>
        <CardContent>
             <Button variant="destructive">Destructive</Button>
             <Button variant="outline" style={{ marginTop: 10 }}>Outline</Button>
        </CardContent>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 20,
    paddingTop: 60,
  },
});
