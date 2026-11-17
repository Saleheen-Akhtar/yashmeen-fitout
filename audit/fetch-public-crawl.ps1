$targets = @(
  @{ Url = 'https://yashmeen-fitout.vercel.app/'; File = 'crawl-home.html'; Headers = 'crawl-home-headers.txt' },
  @{ Url = 'https://yashmeen-fitout.vercel.app/services/interior-design'; File = 'crawl-service.html'; Headers = 'crawl-service-headers.txt' },
  @{ Url = 'https://yashmeen-fitout.vercel.app/robots.txt'; File = 'crawl-robots.txt'; Headers = 'crawl-robots-headers.txt' },
  @{ Url = 'https://yashmeen-fitout.vercel.app/sitemap.xml'; File = 'crawl-sitemap.xml'; Headers = 'crawl-sitemap-headers.txt' },
  @{ Url = 'https://r.jina.ai/https://yashmeen-fitout.vercel.app/'; File = 'crawl-reader.txt'; Headers = 'crawl-reader-headers.txt' }
)
foreach ($target in $targets) {
  Write-Output $target.Url
  & curl.exe -L -sS --max-time 25 --dump-header ('audit/' + $target.Headers) --output ('audit/' + $target.File) --write-out 'HTTP %{http_code}; bytes %{size_download}; final %{url_effective}\n' $target.Url
}
