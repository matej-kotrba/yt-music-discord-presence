use discord_rich_presence::{
    activity::{Activity, Assets, Button, Timestamps},
    DiscordIpc, DiscordIpcClient,
};
use futures_util::sink::SinkExt;
use futures_util::stream::StreamExt;
use serde::Deserialize;
use std::net::SocketAddr;
use tokio::net::TcpListener;
use tokio_tungstenite::accept_async;

#[derive(Debug, Deserialize)]
struct YouTubeInfo {
    name: String,
    author: String,
    #[serde(rename = "coverUrl")]
    cover_url: String,
}

#[tokio::main]
async fn main() {
    let mut client = DiscordIpcClient::new("1401639255263936553").unwrap();
    client.connect().unwrap();

    let addr = "127.0.0.1:9001";
    let listener = TcpListener::bind(&addr).await.expect("Failed to bind");

    println!("Server naslouchá na {}", addr);

    while let Ok((stream, _)) = listener.accept().await {
        handle_connection(&mut client, stream).await;
    }
}

async fn handle_connection(client: &mut DiscordIpcClient, stream: tokio::net::TcpStream) {
    let addr = stream.peer_addr().ok();
    let ws_stream = accept_async(stream).await;

    match ws_stream {
        Ok(mut websocket) => {
            println!("📡 Nové spojení: {:?}", addr);

            while let Some(msg) = websocket.next().await {
                match msg {
                    Ok(msg) if msg.is_text() => {
                        let text = msg.into_text().unwrap();
                        match serde_json::from_str::<YouTubeInfo>(&text) {
                            Ok(info) => {
                                println!("Data: {:?}", info);
                                update_discord_presence(client, info);
                            }
                            Err(e) => {
                                println!("⚠️ Chyba při parsování JSON: {}", e);
                            }
                        }
                    }
                    _ => {}
                }
            }
        }
        Err(e) => {
            println!("❌ Nepodařilo se navázat WebSocket: {}", e);
        }
    }
}

fn update_discord_presence(client: &mut DiscordIpcClient, info: YouTubeInfo) {
    let author_text = format!("{}", info.author);

    let activity = Activity::new()
        .details(&info.name)
        .state(&author_text)
        .assets(
            Assets::new()
                .large_image(&info.cover_url) // viz poznámka níže
                .large_text("YouTube Music"),
        );

    if let Err(err) = client.set_activity(activity) {
        eprintln!("❌ Chyba při nastavování Discord aktivity: {}", err);
    }
}
