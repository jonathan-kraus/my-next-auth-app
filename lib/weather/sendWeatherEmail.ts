import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

type WeatherData = {
  location: string;
  current: {
    temperature: number;
    timestamp: string;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    windGust: number;
    windDirection: number;
    pressure: number;
    uvIndex: number;
    visibility: number;
    cloudCover: number;
    condition: string;
  };
  astronomy: {
    sunrise: string;
    sunset: string;
    moonrise: string | null;
    moonset: string | null;
    moonPhase: number;
    moonPhaseDescription?: string;
    rawSunrise?: string;
    rawSunset?: string;
    rawMoonrise?: string;
    rawMoonset?: string;
    sunIndicator?: unknown;
    moonIndicator?: unknown;
  };
};

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY!,
});

export async function sendWeatherEmail(
  weatherData: WeatherData,
  selectedLocation: string
) {
  const sentFrom = new Sender('jonathan@kraus.my.id', 'Weather Bot');
  const recipients = [new Recipient('jonathan.c.kraus@gmail.com', 'Jonathan')];

  const subject = `Weather update for ${selectedLocation}`;

  const textBody = `Weather update for ${selectedLocation}

Temperature: ${weatherData.current.temperature}°C (Feels like ${weatherData.current.feelsLike}°C)
Condition: ${weatherData.current.condition}
Humidity: ${weatherData.current.humidity}%
Wind: ${weatherData.current.windSpeed} km/h (gust ${weatherData.current.windGust} km/h)
UV Index: ${weatherData.current.uvIndex}
Visibility: ${weatherData.current.visibility} km
Pressure: ${weatherData.current.pressure} hPa

Sunrise: ${weatherData.astronomy.sunrise}
Sunset: ${weatherData.astronomy.sunset}
Moonrise: ${weatherData.astronomy.moonrise ?? 'N/A'}
Moonset: ${weatherData.astronomy.moonset ?? 'N/A'}
Moon phase: ${weatherData.astronomy.moonPhaseDescription ?? 'N/A'}
`;

  const htmlBody = `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #222; }
          .card { max-width: 560px; margin: 0 auto; padding: 16px; border: 1px solid #eee; border-radius: 8px; }
          h2 { margin: 0 0 12px; }
          p { margin: 6px 0; }
          .muted { color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>Weather update for ${selectedLocation}</h2>
          <p><strong>Temperature:</strong> ${weatherData.current.temperature}°C (Feels like ${weatherData.current.feelsLike}°C)</p>
          <p><strong>Condition:</strong> ${weatherData.current.condition}</p>
          <p><strong>Humidity:</strong> ${weatherData.current.humidity}%</p>
          <p><strong>Wind:</strong> ${weatherData.current.windSpeed} km/h (gust ${weatherData.current.windGust} km/h), direction ${weatherData.current.windDirection}°</p>
          <p><strong>UV Index:</strong> ${weatherData.current.uvIndex}</p>
          <p><strong>Visibility:</strong> ${weatherData.current.visibility} km</p>
          <p><strong>Pressure:</strong> ${weatherData.current.pressure} hPa</p>
          <hr/>
          <p><strong>Sunrise:</strong> ${weatherData.astronomy.sunrise}</p>
          <p><strong>Sunset:</strong> ${weatherData.astronomy.sunset}</p>
          <p><strong>Moonrise:</strong> ${weatherData.astronomy.moonrise ?? 'N/A'}</p>
          <p><strong>Moonset:</strong> ${weatherData.astronomy.moonset ?? 'N/A'}</p>
          <p><strong>Moon phase:</strong> ${weatherData.astronomy.moonPhaseDescription ?? 'N/A'}</p>
          <p class="muted">Sent at ${new Date(weatherData.current.timestamp).toLocaleString()}</p>
        </div>
      </body>
    </html>
  `;

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject(subject)
    .setText(textBody)
    .setHtml(htmlBody);

  await mailerSend.email.send(emailParams);
}
