const MainLayout = ({ baseUrl, projectName, children, pathPrefix }) => {
  return (
    <html lang="en">
      <head>
        {baseUrl && <base href={baseUrl} />}
        <link rel="icon" type="image/png" href={`${pathPrefix}favico.png`} />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css"
        />
        <meta charSet="utf-8" />
        <title>{projectName}</title>
        <link rel="stylesheet" href={`${pathPrefix}index.css`} />
        <link rel="stylesheet" href={`${pathPrefix}typography.css`} />
        <link rel="stylesheet" href={`${pathPrefix}form.css`} />
        <link rel="stylesheet" href={`${pathPrefix}auth.css`} />
      </head>
      <body>{children}</body>
    </html>
  )
}

export default MainLayout
