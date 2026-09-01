package com.manutencao.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:manutencaoanexos/");

        registry.addResourceHandler("/aplicativomanutencao/**")
                .addResourceLocations("file:aplicativomanutencao/");

        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/", "file:../manutencao-mobile/dist/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        Resource requestedResource = location.createRelative(resourcePath);
                        if (requestedResource.exists() && requestedResource.isReadable()) {
                            return requestedResource;
                        }
                        if (resourcePath.indexOf('.') > -1) {
                            return null;
                        }
                        return new ClassPathResource("static/index.html");
                    }
                });
    }
}
