Add-Type -AssemblyName System.Drawing
Add-Type @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Collections.Generic;
using System.Runtime.InteropServices;

public class SmartBgRemover {
    // Pass 1: BFS flood-fill starting from image borders (removes outer background)
    // Pass 2: finds any remaining white "islands" completely enclosed by already-transparent pixels
    //         and removes them too (handles cases like the chainsaw handle hole)
    public static void Process(string filePath, int tolerance) {
        Bitmap bmp;
        using (var tmp = new Bitmap(filePath)) {
            bmp = new Bitmap(tmp);
        }

        BitmapData bd = bmp.LockBits(
            new Rectangle(0, 0, bmp.Width, bmp.Height),
            ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
        int stride = bd.Stride;
        int bytes = stride * bmp.Height;
        byte[] px = new byte[bytes];
        Marshal.Copy(bd.Scan0, px, 0, bytes);
        bmp.UnlockBits(bd);

        int w = bmp.Width, h = bmp.Height;
        bool[] visited = new bool[w * h];

        // Check: is pixel near-white?
        Func<int,int,bool> isWhite = (x, y) => {
            int i = y*stride + x*4;
            byte b=px[i], g=px[i+1], r=px[i+2], a=px[i+3];
            if (a < 10) return true; // already transparent counts as "remove"
            return (r>=255-tolerance && g>=255-tolerance && b>=255-tolerance);
        };

        // Make pixel transparent
        Action<int,int> clear = (x, y) => {
            int i = y*stride + x*4;
            px[i+3] = 0;
        };

        // BFS from seed
        Action<int,int> bfs = null;
        bfs = (sx, sy) => {
            Queue<long> q = new Queue<long>();
            int n0 = sy*w+sx;
            if (visited[n0] || !isWhite(sx,sy)) return;
            visited[n0] = true;
            q.Enqueue(n0);
            while (q.Count > 0) {
                long n = q.Dequeue();
                int x=(int)(n%w), y=(int)(n/w);
                clear(x, y);
                int[] dx={-1,1,0,0}, dy={0,0,-1,1};
                for (int d=0; d<4; d++) {
                    int nx=x+dx[d], ny=y+dy[d];
                    if (nx<0||nx>=w||ny<0||ny>=h) continue;
                    int nn=ny*w+nx;
                    if (visited[nn]) continue;
                    if (isWhite(nx,ny)) { visited[nn]=true; q.Enqueue(nn); }
                }
            }
        };

        // --- PASS 1: seed from all 4 edges ---
        for (int x=0; x<w; x++) { bfs(x,0); bfs(x,h-1); }
        for (int y=0; y<h; y++) { bfs(0,y); bfs(w-1,y); }

        // --- PASS 2: find white islands enclosed by transparent ---
        // An "island" is a connected white region that is completely surrounded by transparent.
        // We detect these by finding any unvisited white pixel, BFS it, check if all 
        // border-touching pixels of that region are transparent — if so, clear it.
        for (int y=0; y<h; y++) {
            for (int x=0; x<w; x++) {
                int vi = y*w+x;
                if (visited[vi]) continue;
                int pi = y*stride+x*4;
                byte b=px[pi],g=px[pi+1],r=px[pi+2],a=px[pi+3];
                if (a==0) continue; // already transparent
                if (!(r>=255-tolerance && g>=255-tolerance && b>=255-tolerance)) continue;

                // Found an unvisited white pixel → collect the whole region
                Queue<long> regionQ = new Queue<long>();
                List<long> region = new List<long>();
                bool touchesOpaque = false;
                visited[vi]=true;
                regionQ.Enqueue(vi);
                while (regionQ.Count>0) {
                    long n=regionQ.Dequeue();
                    region.Add(n);
                    int rx=(int)(n%w), ry=(int)(n/w);
                    int[] dx={-1,1,0,0}, dy={0,0,-1,1};
                    for (int d=0; d<4; d++) {
                        int nx=rx+dx[d], ny=ry+dy[d];
                        if (nx<0||nx>=w||ny<0||ny>=h) continue;
                        int nn=ny*w+nx;
                        if (visited[nn]) continue;
                        int npi=ny*stride+nx*4;
                        byte nb=px[npi],ng=px[npi+1],nr=px[npi+2],na=px[npi+3];
                        if (na<10) continue; // already transparent — edge of region
                        if (nr>=255-tolerance && ng>=255-tolerance && nb>=255-tolerance) {
                            visited[nn]=true;
                            regionQ.Enqueue(nn);
                        } else {
                            // Touches a non-white, non-transparent pixel — this is "inside" the drawing
                            // Might be okay to still clear if all neighbors are transparent
                            touchesOpaque = true;
                        }
                    }
                }

                // Only clear regions that don't touch non-white/non-transparent pixels
                // (i.e. wholly bounded by transparent edges) → enclosed holes
                if (!touchesOpaque) {
                    foreach (long n in region) {
                        int rx=(int)(n%w), ry=(int)(n/w);
                        clear(rx, ry);
                    }
                }
            }
        }

        // Write back
        BitmapData bd2 = bmp.LockBits(
            new Rectangle(0, 0, w, h), ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
        Marshal.Copy(px, 0, bd2.Scan0, bytes);
        bmp.UnlockBits(bd2);
        bmp.Save(filePath, ImageFormat.Png);
        bmp.Dispose();
    }
}
"@ -ReferencedAssemblies "System.Drawing"

$folder = "C:\Users\nicol\OneDrive\Documentos\AntigravityPruebas\pusheen-game\assets\images"

# Process only the bruja variants, pijama-angry, pijama-happy (missed accented file),
# and ALL chainsaw variants (re-process for the handle island fix)
$targets = @(
    "pusheen-bruja-happy.png",
    "pusheen-bruja-angry.png",
    "pusheen-pijama-angry.png",
    "pusheen-chainsaw.png",
    "pusheen-chainsaw-happy.png",
    "pusheen-chainsaw-angry.png"
)

Write-Host "Procesando $($targets.Count) archivos con algoritmo mejorado..." -ForegroundColor Cyan

foreach ($name in $targets) {
    $path = Join-Path $folder $name
    if (Test-Path $path) {
        Write-Host "  -> $name" -ForegroundColor Yellow
        [SmartBgRemover]::Process($path, 25)
        Write-Host "     OK" -ForegroundColor Green
    } else {
        Write-Host "  [NO ENCONTRADO] $name" -ForegroundColor Red
    }
}

Write-Host "Listo!" -ForegroundColor Cyan
