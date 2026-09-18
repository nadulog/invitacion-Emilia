$ErrorActionPreference = 'Stop'
$root = [System.IO.Path]::GetFullPath($PSScriptRoot)
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, 5173)
$listener.Start()

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    try {
      $stream = $client.GetStream()
      $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
      $requestLine = $reader.ReadLine()
      while (($line = $reader.ReadLine()) -ne '') {
        if ($null -eq $line) { break }
      }

      $requestPath = '/'
      if ($requestLine -match '^GET\s+([^\s]+)') { $requestPath = $matches[1].Split('?')[0] }
      $relativePath = [System.Uri]::UnescapeDataString($requestPath).TrimStart('/')
      if ([string]::IsNullOrWhiteSpace($relativePath)) { $relativePath = 'index.html' }
      $filePath = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($root, $relativePath.Replace('/', [System.IO.Path]::DirectorySeparatorChar)))

      $status = '200 OK'
      if (-not $filePath.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase) -or -not [System.IO.File]::Exists($filePath)) {
        $status = '404 Not Found'
        $bytes = [System.Text.Encoding]::UTF8.GetBytes('Not found')
        $contentType = 'text/plain; charset=utf-8'
      } else {
        $bytes = [System.IO.File]::ReadAllBytes($filePath)
        $contentType = switch ([System.IO.Path]::GetExtension($filePath).ToLowerInvariant()) {
          '.html' { 'text/html; charset=utf-8' }
          '.css'  { 'text/css; charset=utf-8' }
          '.js'   { 'application/javascript; charset=utf-8' }
          '.png'  { 'image/png' }
          '.jpg'  { 'image/jpeg' }
          '.jpeg' { 'image/jpeg' }
          '.webp' { 'image/webp' }
          default { 'application/octet-stream' }
        }
      }

      $headers = "HTTP/1.1 $status`r`nContent-Type: $contentType`r`nContent-Length: $($bytes.Length)`r`nConnection: close`r`nCache-Control: no-cache`r`n`r`n"
      $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($headers)
      $stream.Write($headerBytes, 0, $headerBytes.Length)
      $stream.Write($bytes, 0, $bytes.Length)
      $stream.Flush()
    } finally {
      $client.Dispose()
    }
  }
} finally {
  $listener.Stop()
}
